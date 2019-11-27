export type VoterName = string;
export type CandidateName = string;
export type Ballot = {
  [CandidateName: string]: number;
};
export type VoterBallotPair = [VoterName, Ballot];

export type AppState = {
  voterBallotPairs: VoterBallotPair[];
  electionResult: CandidateName[] | null;
  // TODO: this will probably be refactored to editState
  voterUnderEdit: VoterName | null;
};

export type Action =
  | {
      type: 'setVoterUnderEdit';
      voter: VoterName | null;
    }
  | {
      type: 'addVoter';
      voter: VoterName;
    }
  | {
      type: 'addCandidate';
    }
  | {
      type: 'setCell';
      candidate: CandidateName;
      voter: VoterName;
      value: string;
    }
  | {
      type: 'setElectionResult';
      electionResult: CandidateName[];
    };
