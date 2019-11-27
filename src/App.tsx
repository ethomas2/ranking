import React, {useState} from 'react';

type VoterName = string;
type CandidateName = string;
type Ballot = {
  [CandidateName: string]: number;
};
type VoterBallotPair = [VoterName, Ballot];
type State = VoterBallotPair[];

const ballot1 = {'candidate 1': 1, 'candidate 2': 2, 'candidate 3': 3};
const ballot2 = {'candidate 1': 1, 'candidate 2': 2, 'candidate 3': 3};
const ballot3 = {'candidate 1': 2, 'candidate 2': 1, 'candidate 3': 3};
const defaultState: State = [
  ['voter 1', ballot1],
  ['voter 2', ballot2],
  ['voter 3', ballot3],
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

const runElection = (ballots: readonly Ballot[]): CandidateName[] => {
  // TODO: what if there's no ballot?
  const candidates = Object.keys(ballots[0]);

  // TODO: consider leaving this as array of tuples
  let tallies: {[candidate: string]: number} = Object.fromEntries(
    candidates.map(c => [c, 0]),
  );
  for (const ballot of ballots) {
    // TODO: this ! is nasty
    const [winnerOfBallot] = Object.entries(ballot).find(
      ([key, val]) => val === 1,
    )!;
    tallies[winnerOfBallot] += 1;
  }

  const maxTally = Math.max(...Object.values(tallies));
  const maximalCandidates = Object.entries(tallies)
    .filter(([candidate, nvotes]) => nvotes === maxTally)
    .map(([candidate]) => candidate);

  // TODO: maybe yield tallies and candidates here

  const oneGuyWon = maximalCandidates.length === 1;
  const everyoneTied = maximalCandidates.length === Object.keys(ballots).length;
  if (oneGuyWon || everyoneTied) {
    return maximalCandidates;
  }

  // shrink ballots
  const minTally = Math.min(...Object.values(tallies));
  const [minimumCandidate] = Object.entries(tallies).find(
    ([candidate, nvotes]) => nvotes === minTally,
  )!;

  const newBallots = ballots.map(ballot => {
    // TODO: remove intermediate values
    const pairs = Object.entries(ballot);
    const sorted = pairs.sort(([, n1], [, n2]) => n1 - n2);
    const withoutMinimum = sorted.filter(
      ([candidate]) => candidate !== minimumCandidate,
    );
    const newBallot = Object.fromEntries(
      withoutMinimum.map(([candidate], index) => [candidate, index + 1]),
    );
    return newBallot;
  });

  return runElection(newBallots);
};

const App: React.FC = () => {
  const [electionState, setState] = useState(defaultState);
  const [electionResult, setElectionResult] = useState<CandidateName[] | null>(
    null,
  );
  const [voterUnderEdit, setVoterUnderEdit] = useState<VoterName | null>(null);

  // TODO: make sure all people have all the same candidate keys
  // TODO: this will break if we have 0 ballots
  const candidates = Object.keys(electionState[0][1]);

  const setCell = (
    candidate: CandidateName,
    voter: VoterName,
    value: string,
  ) => {
    const newState = [...electionState];
    // TODO: ! is bad
    const [, ballot] = newState.find(
      ([voterName, ballot]) => voterName === voter,
    )!;
    ballot[candidate] = Number(value);
    setState(newState);
  };

  // TODO: move setcell, addcandidate, addvoter to dispatch actions

  const tableBodyContent = candidates.map(candidate => (
    <tr key={`candidate-row-${candidate}`}>
      <td>{candidate}</td>
      {electionState.map(([voter, ballot]) => (
        <td
          onClick={e => setVoterUnderEdit(voter)}
          key={`td-candidate-${candidate}-voter-${voter}`}>
          {voterUnderEdit === voter ? (
            <input
              value={ballot[candidate]}
              onChange={e => {
                setCell(candidate, voter, e.target.value);
              }}
              onKeyDown={e => e.keyCode === 13 && setVoterUnderEdit(null)}
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
      {electionState.map(([voter]) => (
        <th key={`voter-${voter}`}>{voter}</th>
      ))}
      <th>
        <input
          value="Add person"
          type="button"
          onClick={() => setState(addVoter(electionState, 'King Phillip'))}
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
                onClick={() => addCandidate(electionState, setState)}
              />
            </td>
          </tr>
        </tfoot>
      </table>
      <input
        type="button"
        value="Submit"
        onClick={() => {
          const ballots = electionState.map(([, ballot]) => ballot);
          const electionResult = runElection(ballots);
          setElectionResult(electionResult);
        }}
      />
      {electionResult}
    </div>
  );
};

export default App;
