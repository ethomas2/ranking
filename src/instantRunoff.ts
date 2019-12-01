export type Ballot = {
  [CandidateName: string]: number;
};
type CandidateName = string;

export const runElection = (ballots: readonly Ballot[]): CandidateName[] => {
  // TODO: what if there's no ballot?
  const candidates = Object.keys(ballots[0]);

  // TODO: consider leaving this as array of tuples
  let tallies: {[candidate: string]: number} = Object.fromEntries(
    candidates.map(c => [c, 0]),
  );

  debugger;
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
