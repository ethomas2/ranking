import React, {useState} from 'react';

type VoterName = string;
type CandidateName = string;
type Ballot = {
  [CandidateName: string]: number;
};
type VoterBallotPair = [VoterName, Ballot];
type State = VoterBallotPair[];

const ballot1 = {'candidate 1': 1, 'candidate 2': 2, 'candidate 3': 3};
const ballot2 = {'candidate 1': 3, 'candidate 2': 2, 'candidate 3': 1};
const ballot3 = {'candidate 1': 2, 'candidate 2': 1, 'candidate 3': 3};
const defaultState: State = [
  ['person 1', ballot1],
  ['person 2', ballot2],
  ['person 3', ballot3],
];

const addVoter = (
  currentState: Readonly<State>,
  newVoterName: string,
): State => {
  // TODO: this will error if no candidates exist
  // TODO: only add if newVoterName does not exist in list of people
  // TODO: this looks like a job for useReducer
  // TODO: can we list comprehension this?
  const candidates = Object.keys(currentState[0][1]);
  let newBallot: Ballot = {};
  let i = 1;
  for (const candidate of candidates) {
    newBallot[candidate] = i;
    i++;
  }
  return [...currentState, [newVoterName, newBallot]];
};

const addCandidate = (
  currentState: Readonly<State>,
  setState: (s: State) => void,
) => {
  const ncandidates = Object.keys(currentState[0][1]).length;
  const newState = [...currentState];
  const newBookName = `Book ${ncandidates + 1}`;
  for (const [, ballot] of newState) {
    ballot[newBookName] = ncandidates + 1;
  }
  setState(newState);
};

// const runElection = (ballots: readonly Ballot[]) => {
//   const tallies: _Map<CandidateName, number>  = tally(ballots);
// }

const App: React.FC = () => {
  const [electionState, setState] = useState(defaultState);

  // TODO: make sure all people have all the same candidate keys
  const candidates = Object.keys(ballot1);

  const tableBodyContent = candidates.map(candidate => (
    <tr key={`candidate-row-${candidate}`}>
      <td>{candidate}</td>
      {electionState.map(([person, ballot]) => (
        <td key={`candidate-${candidate}-person-${person}`}>{ballot[candidate]}</td>
      ))}
    </tr>
  ));

  const tableHeaderContent = (
    <tr>
      <th />
      {electionState.map(([person]) => (
        <th key={`person-${person}`}>{person}</th>
      ))}
      <th>
        <input
          value="Add person"
          type="button"
          onClick={() =>
            setState(addVoter(electionState, 'King Phillip'))
          }
        />
      </th>
    </tr>
  );

  return (
    <table>
      <thead>{tableHeaderContent}</thead>
      <tbody>{tableBodyContent}</tbody>
      <tfoot>
        <tr>
          <td>
            <input
              value="Add candidate"
              type="button"
              onClick={() => addCandidate(electionState, setState)}
            />
          </td>
        </tr>
      </tfoot>
    </table>
  );
};

export default App;
