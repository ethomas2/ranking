import itertools
import os
import json

from flask import Flask
import flask
app = Flask(__name__)

ELECTIONS_DIR = 'elections'


@app.route("/election/<id>", methods=['GET'])
def get_election(election_id):
    resp = flask.Response(json.dumps({'id': 1}))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    print(election_id)
    return resp


@app.route("/elections", methods=['POST'])
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
        print(json.dumps({}), file=f)

    resp = flask.Response(json.dumps({'id': 1}))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


if __name__ == "__main__":
    app.run(port=8000)
