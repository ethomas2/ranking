import React, {useReducer, useState} from 'react';
import {AppState, Action, VoterName, CandidateName} from './types';
import {reducer, runElection} from './reducers';
import './App.css';

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
  const {voterBallotPairs, electionResult} = state;

  // TODO: make sure all people have all the same candidate keys
  // TODO: this will break if we have 0 ballots
  const candidates = Object.keys(voterBallotPairs[0][1]);

  // TODO: move setcell, addcandidate, addvoter to dispatch actions

  const tableBodyContent = candidates.map(candidate => (
    <tr key={`candidate-row-${candidate}`}>
      <td>
        <CandidateNameCell
          state={state}
          dispatch={dispatch}
          candidate={candidate}
        />
      </td>
      {voterBallotPairs.map(([voter]) => (
        <td key={`td-candidate-${candidate}-voter-${voter}`}>
          <TableBodyCell
            voter={voter}
            candidate={candidate}
            state={state}
            dispatch={dispatch}
          />
        </td>
      ))}
    </tr>
  ));

  const tableHeaderContent = (
    <tr>
      <th />
      {voterBallotPairs.map(([voter]) => (
        <th key={`voter-${voter}`}>
          <VoterHeaderCell state={state} dispatch={dispatch} voter={voter} />
        </th>
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

type TableBodyCellProps = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  voter: VoterName;
  candidate: CandidateName;
};
const TableBodyCell: React.FC<TableBodyCellProps> = props => {
  const {
    state: {editState, voterBallotPairs},
    dispatch,
    voter,
    candidate,
  } = props;
  const [autoFocus, setAutoFocus] = useState<boolean>(false);
  // TODO: utility function getBallot(state, 'voter')
  const [, ballot] = voterBallotPairs.find(([v]) => v === voter)!;
  let content;
  if (
    editState &&
    editState.type === 'editBallot' &&
    editState.voter === voter
  ) {
    content = (
      <input
        autoFocus={autoFocus}
        value={editState.tempBallot[candidate]}
        onChange={e =>
          dispatch({
            type: 'setTempBallot',
            candidate,
            value: e.target.value,
          })
        }
        onKeyDown={e => e.keyCode === 13 && dispatch({type: 'commitEditState'})}
      />
    );
  } else {
    content = String(ballot[candidate]);
    if (autoFocus) {
      // TODO: this is disgusting. You should feel bad
      setAutoFocus(false);
    }
  }
  return (
    <div onClick={e => dispatch({type: 'editBallot', voter})}>{content}</div>
  );
};

type VoterHeaderCellProps = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  voter: VoterName;
};
const VoterHeaderCell: React.FC<VoterHeaderCellProps> = props => {
  const {
    state: {editState},
    dispatch,
    voter,
  } = props;
  let content;
  if (
    editState &&
    editState.type === 'editVoterName' &&
    editState.oldName === voter
  ) {
    content = (
      <input
        autoFocus
        value={editState.newName}
        onChange={e =>
          dispatch({
            type: 'changeVoterName',
            value: e.target.value,
          })
        }
        onKeyDown={e => e.keyCode === 13 && dispatch({type: 'commitEditState'})}
      />
    );
  } else {
    content = voter;
  }
  return (
    <div onClick={() => dispatch({type: 'editVoterName', voter})}>
      {content}
    </div>
  );
};

type CandidateNameCellProps = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  candidate: CandidateName;
};
const CandidateNameCell: React.FC<CandidateNameCellProps> = props => {
  const {
    state: {editState},
    dispatch,
    candidate,
  } = props;
  let content;
  if (
    editState &&
    editState.type === 'editCandidateName' &&
    editState.oldName === candidate
  ) {
    content = (
      <input
        autoFocus
        value={editState.newName}
        onChange={e =>
          dispatch({
            type: 'changeCandidateName',
            value: e.target.value,
          })
        }
        onKeyDown={e => e.keyCode === 13 && dispatch({type: 'commitEditState'})}
      />
    );
  } else {
    content = candidate;
  }
  return (
    <div onClick={() => dispatch({type: 'editCandidateName', candidate})}>
      {content}
    </div>
  );
};
