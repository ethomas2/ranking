import functools
import itertools
import json
import os
import sys
import threading
import traceback

from flask import Flask, request, Response
from flask_cors import CORS

app = Flask('elections')
CORS(app, resources={r"*": {"origins": "*"}})

DB_DIR = 'db'


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
                return Response(json.dumps({
                    'error': str(e),
                }), status=500)

    return g


def _response(arg, **kwargs):
    return Response(json.dumps(arg), **kwargs)


@app.route("/election/<election_id>", methods=['GET'])
@wrap_response
def get_election(election_id: str):

    if election_id not in os.listdir(DB_DIR):
        return _response(
            {'error': f'Election id {election_id} not found'},
            status=404
        )

    return _response(_get_election(election_id))


@app.route("/elections", methods=['POST', 'GET'])
@wrap_response
def elections():
    if request.method == 'POST':
        return _response(_new_election())
    elif request.method == 'GET':
        return _response(_get_all_elections())
    else:
        return _response({}, status=405)


def _new_election():
    try:
        os.mkdir(DB_DIR)
    except FileExistsError:
        pass
    existing_ids = map(int, os.listdir(DB_DIR))
    next_election_id = str(max(existing_ids) + 1)
    next_election_path = os.path.join(DB_DIR, next_election_id)
    with open(next_election_path, 'w') as f:
        f.write(json.dumps({
            'body': [], 'header': [], 'leftCol': [],
            'title': f'My Title - {next_election_id}'
        }))

    return {'id': next_election_id}


def _get_all_elections():
    filenames = os.listdir(DB_DIR)
    return {
        'elections': [
            _get_election(fname) for fname in filenames
        ]
    }


def _get_election(election_id: str):
    with open(f'{DB_DIR}/{election_id}') as f:
        data = json.loads(f.read().strip())
        data['id'] = election_id
        return data


@app.route("/election/<election_id>", methods=['PUT'])
@wrap_response
def update_election(election_id):
    try:
        os.mkdir(DB_DIR)
    except FileExistsError:
        pass

    updates = json.loads(request.data.decode('utf-8'))
    with open(f'{DB_DIR}/{election_id}', 'r') as f:
        current_data = json.loads(f.read().strip())

    newData = {**current_data, **updates}
    with open(f'{DB_DIR}/{election_id}', 'w') as f:
        f.write(json.dumps(newData))
    return _response({})


if __name__ == "__main__":
    # This configuration doesn't control prod port/host.
    app.run(port=8000, host='0.0.0.0')
