import {
  Ballot,
  VoterBallotPair,
  CandidateName,
  AppState,
  Action,
  VoterName,
} from './types';

export const reducer = (state: AppState, action: Action): AppState => {
  const {voterBallotPairs} = state;
  switch (action.type) {
    case 'setVoterUnderEdit':
      return {...state, voterUnderEdit: action.voter};
    case 'addVoter':
      return {
        ...state,
        voterBallotPairs: addVoter(voterBallotPairs, action.voter),
      };
    case 'addCandidate':
      return {...state, voterBallotPairs: addCandidate(voterBallotPairs)};
    case 'setCell':
      return {
        ...state,
        voterBallotPairs: setCell(
          voterBallotPairs,
          action.candidate,
          action.voter,
          action.value,
        ),
      };
    case 'setElectionResult':
      return {...state, electionResult: action.electionResult};
  }
};

export const addVoter = (
  voterBallotPairs: VoterBallotPair[],
  newVoterName: string,
): VoterBallotPair[] => {
  // TODO: this will error if no candidates exist
  // TODO: only add if newVoterName does not exist in list of people
  // TODO: this looks like a job for useReducer
  // TODO: can we list comprehension this?
  const candidates = Object.keys(voterBallotPairs[0][1]);
  let newBallot: Ballot = {};
  let i = 1;
  for (const candidate of candidates) {
    newBallot[candidate] = i;
    i++;
  }
  return [...voterBallotPairs, [newVoterName, newBallot]];
};

export const addCandidate = (
  voterBallotPairs: readonly VoterBallotPair[],
): VoterBallotPair[] => {
  const ncandidates = Object.keys(voterBallotPairs[0][1]).length;
  const newState = [...voterBallotPairs];
  const newBookName = `Book ${ncandidates + 1}`;
  for (const [, ballot] of newState) {
    ballot[newBookName] = ncandidates + 1;
  }
  return newState;
};

const setCell = (
  voterBallotPairs: VoterBallotPair[],
  candidate: CandidateName,
  voter: VoterName,
  value: string,
): VoterBallotPair[] => {
  const newState = [...voterBallotPairs];
  // TODO: ! is bad
  const [, ballot] = newState.find(
    ([voterName, ballot]) => voterName === voter,
  )!;
  ballot[candidate] = Number(value);
  return newState;
};

export const runElection = (ballots: readonly Ballot[]): CandidateName[] => {
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
