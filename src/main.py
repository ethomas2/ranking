import functools
import json
import os
import sys
import threading
import traceback

import typing as t

from flask import Flask, request, Response
from flask_cors import CORS

from . import types

app = Flask('elections')
CORS(app, resources={r"*": {"origins": "*"}})

DB_DIR = os.environ.get('APP_DB_DIR', 'db')
VERSION = 'version'


# Really only need a lock on a per-election basis, but fuck it.
global_lock = threading.Lock()


def wrap_response(f):
    @functools.wraps(f)
    def g(*args, **kwargs):
        with global_lock:
            try:
                return f(*args, **kwargs)
            except Exception as e:
                traceback.print_exc(file=sys.stderr)
                return _error(str(e), status=500)

    return g


def _response(arg, **kwargs) -> Response:
    return Response(json.dumps(arg), **kwargs)


def _error(msg: str, status: int, **kwargs) -> Response:
    return _response({'error': msg, **kwargs}, status=status)


@app.route("/election/<election_id>", methods=['GET', 'DELETE'])
@wrap_response
def get_election(election_id: str) -> Response:
    try:
        os.makedirs(DB_DIR)
    except FileExistsError:
        pass

    if request.method == 'GET':
        # TODO: make _get_election return NOne and do if _get_election is None
        # return 404
        if election_id not in os.listdir(DB_DIR):
            return _error(f'Election id {election_id} not found', status=404)

        return _response(_get_election(election_id))
    elif request.method == 'DELETE':
        os.remove(os.path.join(DB_DIR, election_id))
        return _response({})
    else:
        return _error('Invalid http method', 405)


@app.route("/elections", methods=['POST', 'GET'])
@wrap_response
def elections() -> Response:
    try:
        os.makedirs(DB_DIR)
    except FileExistsError:
        pass

    if request.method == 'POST':
        return _response(_new_election())
    elif request.method == 'GET':
        return _response(_get_all_elections())
    else:
        return _error('Invalid http method', status=405)


class NewElectionResp(t.TypedDict):
    id: str


def _new_election() -> types.Election:
    try:
        os.makedirs(DB_DIR)
    except FileExistsError:
        pass
    existing_ids = list(map(int, os.listdir(DB_DIR)))
    next_election_id = str(max(existing_ids) + 1) if existing_ids else '0'
    next_election_path = os.path.join(DB_DIR, next_election_id)
    with open(next_election_path, 'w') as f:
        data = {
            'id': next_election_id,
            'body': [],
            'header': [],
            'leftCol': [],
            'title': f'My Title - {next_election_id}',
            VERSION: 0,
        }
        f.write(json.dumps(data))

    return data


class GetAllElectionsResp(t.TypedDict):
    elections: t.List[types.Election]


def _get_all_elections() -> GetAllElectionsResp:
    filenames = os.listdir(DB_DIR)
    return {
        'elections': [
            _get_election(fname) for fname in filenames
        ]
    }


def _get_election(election_id: str) -> types.Election:
    # TODO: return None if doesn't exist
    with open(os.path.join(DB_DIR, election_id)) as f:
        filecontent = f.read().strip()
        print(filecontent, file=sys.stderr)
        data = json.loads(filecontent)
        data['id'] = election_id
        return data


@app.route("/election/<election_id>", methods=['PUT'])
@wrap_response
def update_election(election_id) -> Response:
    try:
        os.makedirs(DB_DIR)
    except FileExistsError:
        pass

    conflict = _detect_version_conflict(election_id)
    if conflict is not None:
        return conflict

    updates = json.loads(request.data.decode('utf-8'))
    with open(f'{DB_DIR}/{election_id}', 'r') as f:
        current_data = json.loads(f.read().strip())

    new_data = {**current_data, **updates}
    new_version = new_data.get(VERSION, 0) + 1
    new_data[VERSION] = new_version
    with open(f'{DB_DIR}/{election_id}', 'w') as f:
        f.write(json.dumps(new_data))

    return _response(new_data)


def _detect_version_conflict(election_id) -> t.Optional[Response]:
    data = json.loads(request.data.decode('utf-8'))
    version_from_request = data.get('version')
    if version_from_request is None:
        return _error('No version in request', 400)
    version_from_request = int(version_from_request)

    filepath = f'{DB_DIR}/{election_id}'
    if not os.path.exists(filepath):
        return _error(
            f'Election {election_id} does not exist',
            status=404,
            versionConflict=True,
        )

    with open(filepath, 'r') as f:
        version_from_db = int(json.load(f)['version'])

    if version_from_request < version_from_db:
        return _error(
            f'Version conflict: Request version={version_from_request}, '
            f'db version={version_from_db}',
            status=400,
            versionConflict=True,
        )
    return None


if __name__ == "__main__":
    # This configuration doesn't control prod port/host.
    app.run(port=8000, host='0.0.0.0')
