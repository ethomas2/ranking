export type VoterName = string;
export type CandidateName = string;
export type Ballot = {
  [CandidateName: string]: number;
};
export type TempBallot = {
  [CandidateName: string]: string;
};
export type VoterBallotPair = [VoterName, Ballot];

export type EditState =
  | {
      type: 'editBallot';
      voter: VoterName; // The voter's name of the ballot we're editing
      tempBallot: TempBallot;
    }
  // | {
      // type: 'editVoterName';
    // }
  // | {
      // type: 'editCandidateName';
    // }
  | null;

export type AppState = {
  voterBallotPairs: VoterBallotPair[];
  electionResult: CandidateName[] | null;
  editState: EditState;
};

export type Action =
  | {
      type: 'editBallot';
      voter: VoterName;
    }
  | {
      type: 'setTempBallot';
      candidate: CandidateName;
      value: string;
    }
  | {
      type: 'commitEditState';
    }
  | {
      type: 'addVoter';
      voter: VoterName;
    }
  | {
      type: 'addCandidate';
    }
  | {
      type: 'setElectionResult';
      electionResult: CandidateName[];
    };
