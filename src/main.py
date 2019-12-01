import itertools
import os
import json
import functools

from flask import Flask
import flask
app = Flask(__name__)

ELECTIONS_DIR = 'elections'


def flask_wrapper(f):
    @functools.wraps(f)
    def g(*args, **kwargs):
        try:
            data = f(*args, **kwargs)
            resp = flask.Response(json.dumps(data))
        except Exception as e:
            resp = flask.Response(json.dumps({
                'error': str(e),
            }), status=500)

        resp.headers['Access-Control-Allow-Origin'] = '*'
        return resp
    return g


@app.route("/election/<election_id>", methods=['GET'])
@flask_wrapper
def get_election(election_id):
    with open(f'{ELECTIONS_DIR}/{election_id}') as f:
        data = f.read().strip()
        return json.loads(data)


@app.route("/elections", methods=['POST'])
@flask_wrapper
def new_election():
    try:
        os.mkdir(ELECTIONS_DIR)
    except FileExistsError:
        pass
    existing_ids = set(map(int, os.listdir(ELECTIONS_DIR)))
    next_election_id = str(next(
        (i for i in itertools.count() if i not in existing_ids)))
    next_election_path = os.path.join(ELECTIONS_DIR, next_election_id)
    with open(next_election_path, 'w') as f:
        print(json.dumps({'body': [], 'header': [], 'leftCol': []}), file=f)

    return {'id': next_election_path}


if __name__ == "__main__":
    app.run(port=8000)
