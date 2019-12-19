import traceback
import sys
import itertools
import os
import json
import functools

from flask import Flask, request, Response
from flask_cors import CORS

app = Flask('elections')
CORS(app, resources={r"*": {"origins": "*"}})

DB_DIR = 'db'


def wrap_response(f):
    @functools.wraps(f)
    def g(*args, **kwargs):
        try:
            retval = f(*args, **kwargs)
            resp = Response(
                json.dumps(retval)) if retval else Response(json.dumps({}))
        except Exception as e:
            traceback.print_exc(file=sys.stderr)
            resp = Response(json.dumps({
                'error': str(e),
            }), status=500)

        return resp
    return g


@app.route("/election/<election_id>", methods=['GET'])
@wrap_response
def get_election(election_id: str):
    return _get_election(election_id)


def _get_election(election_id: str):
    with open(f'{DB_DIR}/{election_id}') as f:
        data = json.loads(f.read().strip())
        data['id'] = election_id
        return data


@app.route("/elections", methods=['POST', 'GET'])
@wrap_response
def elections():
    if request.method == 'POST':
        return _new_election()
    elif request.method == 'GET':
        return _get_all_elections()
    else:
        # TODO: return 405
        pass


def _new_election():
    try:
        os.mkdir(DB_DIR)
    except FileExistsError:
        pass
    existing_ids = set(map(int, os.listdir(DB_DIR)))
    next_election_id = str(next(
        (i for i in itertools.count() if i not in existing_ids)))
    next_election_path = os.path.join(DB_DIR, next_election_id)
    with open(next_election_path, 'w') as f:
        f.write(json.dumps({'body': [], 'header': [], 'leftCol': []}))

    return {'id': next_election_id}


def _get_all_elections():
    filenames = os.listdir(DB_DIR)
    return {
        'elections': [
            _get_election(fname) for fname in filenames
        ]
    }


@app.route("/election/<election_id>", methods=['PUT'])
@wrap_response
def update_election(election_id):
    try:
        os.mkdir(DB_DIR)
    except FileExistsError:
        pass
    with open(f'{DB_DIR}/{election_id}', 'w') as f:
        f.write(request.data.decode('utf-8'))


if __name__ == "__main__":
    # This configuration doesn't control prod port/host.
    app.run(port=8000, host='0.0.0.0')
