import {
  Ballot,
  VoterBallotPair,
  CandidateName,
  AppState,
  Action,
  VoterName,
  EditState,
} from './types';
import _ from 'lodash';

export const reducer = (state: AppState, action: Action): AppState => {
  const {voterBallotPairs} = state;
  switch (action.type) {
    case 'editBallot':
      return {...state, editState: editBallot(state, action.voter)};
    case 'setTempBallot':
      return setTempBallot(state, action.candidate, action.value);
    case 'commitEditState':
      return commitEditState(state);
    case 'addVoter':
      return {
        ...state,
        voterBallotPairs: addVoter(voterBallotPairs, action.voter),
      };
    case 'addCandidate':
      return {...state, voterBallotPairs: addCandidate(voterBallotPairs)};
    case 'setElectionResult':
      return {...state, electionResult: action.electionResult};
  }
};

const editBallot = (state: AppState, voter: VoterName): EditState => {
  const pair = state.voterBallotPairs.find(([v, ballot]) => v === voter);
  if (!pair) {
    return state.editState;
  }
  const [, ballot] = pair;
  const tempBallot = _.mapValues(ballot, String);
  return {
    type: 'editBallot',
    voter,
    tempBallot,
  };
};

const setTempBallot = (
  state: AppState,
  candidate: CandidateName,
  value: string,
): AppState => {
  if (!state.editState || state.editState.type !== 'editBallot') {
    return state;
  }
  const tempBallotCopy = {...state.editState.tempBallot};
  tempBallotCopy[candidate] = value;
  return {
    ...state,
    editState: {
      ...state.editState,
      tempBallot: tempBallotCopy,
    }
  };
};

const commitEditState = (state: AppState): AppState => {
  const { editState, voterBallotPairs } = state;
  if (editState === null) {
    return state;
  }
  const { tempBallot } = editState;
  const voterBallotPairsCopy = _.cloneDeep(voterBallotPairs)
  for (const pair of voterBallotPairsCopy) {
    const [voter, ] = pair;
    if (voter === editState.voter) {
      // TODO: error state if can't map number?
      pair[1] =  _.mapValues(tempBallot, Number);
    }
  }
  return {
    ...state,
    voterBallotPairs: voterBallotPairsCopy,
    editState: null,
  }

}

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
