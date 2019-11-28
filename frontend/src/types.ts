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
  | {
      type: 'editVoterName';
      oldName: VoterName;
      newName: VoterName;
    }
  | {
      type: 'editCandidateName';
      oldName: CandidateName;
      newName: CandidateName;
    }
  | null;

export type AppState = {
  voterBallotPairs: VoterBallotPair[];
  electionResult: CandidateName[] | null;
  editState: EditState;
};

export type Action =
  | {
      // enter edit state in mode editBallot
      type: 'editBallot';
      voter: VoterName;
    }
  | {
      type: 'setTempBallot';
      candidate: CandidateName;
      value: string;
    }
  | {
      // enter edit state in mode editVoterName
      // TODO: rename actions with naming conventsion enterEditState, editFoo
      type: 'editVoterName';
      voter: VoterName;
    }
  | {
      type: 'changeVoterName';
      value: VoterName;
    }
  | {
      type: 'editCandidateName';
      candidate: CandidateName;
    }
  | {
      type: 'changeCandidateName';
      value: CandidateName;
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
