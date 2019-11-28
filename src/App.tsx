import React, {useReducer} from 'react';
import {AppState, Action} from './types';
import {reducer, runElection} from './reducers';

const defaultBallot1 = {'candidate 1': 1, 'candidate 2': 2, 'candidate 3': 3};
const defaultBallot2 = {'candidate 1': 1, 'candidate 2': 2, 'candidate 3': 3};
const defaultBallot3 = {'candidate 1': 2, 'candidate 2': 1, 'candidate 3': 3};

const defaultState: AppState = {
  voterBallotPairs: [
    ['voter 1', defaultBallot1],
    ['voter 2', defaultBallot2],
    ['voter 3', defaultBallot3],
  ],

  electionResult: null,
  editState: null,
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer<React.Reducer<AppState, Action>>(
    reducer,
    defaultState,
  );
  const {voterBallotPairs, electionResult, editState} = state;

  // TODO: make sure all people have all the same candidate keys
  // TODO: this will break if we have 0 ballots
  const candidates = Object.keys(voterBallotPairs[0][1]);

  // TODO: move setcell, addcandidate, addvoter to dispatch actions

  const tableBodyContent = candidates.map(candidate => (
    <tr key={`candidate-row-${candidate}`}>
      <td>{candidate}</td>
      {voterBallotPairs.map(([voter, ballot]) => (
        <td
          onClick={e => dispatch({type: 'editBallot', voter})}
          key={`td-candidate-${candidate}-voter-${voter}`}>
          {editState && editState.type === 'editBallot' && editState.voter === voter ? (
            <input
              value={editState.tempBallot[candidate]}
              onChange={e =>
                dispatch({
                  type: 'setTempBallot',
                  candidate,
                  value: e.target.value,
                })
              }
              onKeyDown={e =>
                e.keyCode === 13 &&
                dispatch({type: 'commitEditState'})
              }
            />
          ) : (
            ballot[candidate]
          )}
        </td>
      ))}
    </tr>
  ));

  const tableHeaderContent = (
    <tr>
      <th />
      {voterBallotPairs.map(([voter]) => (
        <th key={`voter-${voter}`}>{voter}</th>
      ))}
      <th>
        <input
          value="Add person"
          type="button"
          onClick={() => dispatch({type: 'addVoter', voter: 'King Phillip'})}
        />
      </th>
    </tr>
  );

  return (
    <div>
      <table>
        <thead>{tableHeaderContent}</thead>
        <tbody>{tableBodyContent}</tbody>
        <tfoot>
          <tr>
            <td>
              <input
                value="Add candidate"
                type="button"
                onClick={() => dispatch({type: 'addCandidate'})}
              />
            </td>
          </tr>
        </tfoot>
      </table>
      <input
        type="button"
        value="Submit"
        onClick={() => {
          const ballots = voterBallotPairs.map(([, ballot]) => ballot);
          const electionResult = runElection(ballots);
          dispatch({type: 'setElectionResult', electionResult});
        }}
      />
      {electionResult}
    </div>
  );
};

export default App;
