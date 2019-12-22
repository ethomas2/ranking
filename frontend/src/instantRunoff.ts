import _ from 'lodash';
import {
  excludeIndicies,
  rankNTallies,
  enumerate,
  justify,
  crossProduct,
} from './utils';

type CandidateName = string;

// The iteration function does one iteration of the instant runoff algorithm. The result of an iteration can be either that
// * one winner is declared, or
// * it's a tie between multiple candidates (and we can't break the tie by
//   looking at 2nd place votes), or
// * the iteration eliminated at least one candidate, but multiple candidate
//   remain. Another iteration is needed to declare a winner
type IterationResult =
  | {
      type: 'WINNER';
      winner: CandidateName;
      highlightIndicies: [number, number][];
    }
  | {
      type: 'TIE';
      winners: CandidateName[];
    }
  | {
      type: 'ELIMINATED';
      newData: number[][];
      newCandidates: CandidateName[];
      highlightIndicies: [number, number][];
      eliminatedRows: number[];
    };

export function iteration(
  candidates: CandidateName[],
  data: number[][],
): IterationResult {
  /* Run one iteration of the instant runoff algorithm. See
   *
   * https://en.wikipedia.org/wiki/Instant-runoff_voting#Process
   * and
   * https://electowiki.org/wiki/Instant-runoff_voting#Special_cases_of_IRV_eliminations.
   *
   * There isn't consensus on which candidate(s) the algorithim should
   * eliminate when there are multiple candidates who recieved the least number
   * of rank 1 votes. This will probably happen frequently when the number of
   * voters is small. This implementation works by eliminating all last place
   * candidates if that leaves the set of candidates non-empty, otherwise try
   * to eliminate the candidate with the fewest number of 2nd place votes. If
   * there are still ties eliminate candidate with fewest 3rd place votes, etc.
   */

  // TODO: this would probably be simpler if you don't pass in the candidates
  // array. Just return the index of the winner/winner(s)

  const numVoters = data[0].length; // TODO: what if data is []
  const ncandidates = candidates.length;
  const majority = Math.floor(numVoters / 2) + 1;

  const rank1Counts = rankNTallies(1, data);
  const maxRank1sRecieved = Math.max(...rank1Counts);
  const leastRank1sRecieved = Math.min(...rank1Counts);

  const indiciesOfLeastRank1s = enumerate(rank1Counts)
    .filter(([idx, nRank1Counts]) => nRank1Counts === leastRank1sRecieved)
    .map(([idx]) => idx!); // TODO: nasty idx!. Write your own zip and map(fst)

  // Case 1.
  // Someone recieved more than N/2 1st place votes. Declare that guy
  // the winner
  if (maxRank1sRecieved >= majority) {
    const idx = rank1Counts.indexOf(maxRank1sRecieved);
    const winner = candidates[idx];

    const highlightIndicies = crossProduct(
      _.range(ncandidates),
      _.range(numVoters),
    ).filter(([rowIdx, colIdx]) => data[rowIdx][colIdx] === 1);

    return {type: 'WINNER', winner, highlightIndicies};
  }

  // Case 2.
  // A strict subset of candidates recieved K rank 1 votes, where K is the
  // fewest number of rank 1 votes any candidate recieved. Eliminate all
  // candidates that recieved K votes.
  if (indiciesOfLeastRank1s.length < ncandidates) {
    const newCandidates = excludeIndicies(candidates, indiciesOfLeastRank1s);
    const newData = _.chain(excludeIndicies(data, indiciesOfLeastRank1s))
      .unzip() // transpose
      .map(justify)
      .unzip() // transpose again
      .value();

    const highlightIndicies = crossProduct(
      _.range(ncandidates),
      _.range(numVoters),
    ).filter(([rowIdx, colIdx]) => data[rowIdx][colIdx] === 1);

    return {
      type: 'ELIMINATED',
      newCandidates,
      newData,
      highlightIndicies,
      eliminatedRows: indiciesOfLeastRank1s,
    };
  }

  // Case 3.
  // Every candidate received K rank 1 votes, where K is the feweest number of
  // rank 1 votes any candidate recieved. We can't eliminate everyone, so try
  // to eliminate all the candidates with the fewest number of rank 2 votes. If
  // there's still a tie eliminate fewest number of 3rd place votes, etc. If
  // everyone ties on every rank (which will only happen if every ballot is
  // identical) then give up and decalare everyone the winner
  for (let n = 2; n < ncandidates + 1; n++) {
    // TODO: if we start this at n = 1 can we merge the code from case 1 and
    // case 2?
    const rankNCounts = rankNTallies(n, data);
    const leastRankNsRecieved = Math.min(...rankNCounts);
    const indicies = enumerate(rankNCounts)
      .filter(([, count]) => count === leastRankNsRecieved)
      .map(([idx]) => idx!);

    if (indicies.length === ncandidates) {
      // everyone tied again. Try to eliminate the candidate with fewest n+1
      // votes
      continue;
    } else {
      // Found a strict subset of candidates that recieved least votes.
      // Eliminate them
      const newCandidates = excludeIndicies(candidates, indicies);
      const newData = _.chain(excludeIndicies(data, indicies))
        .unzip() // transpose
        .map(justify)
        .unzip() // transpose again
        .value();

      const highlightIndicies = crossProduct(
        _.range(ncandidates),
        _.range(numVoters),
      ).filter(([rowIdx, colIdx]) => data[rowIdx][colIdx] === n);
      return {
        type: 'ELIMINATED',
        newCandidates,
        newData,
        highlightIndicies,
        eliminatedRows: indicies,
      };
    }
  }
  return {type: 'TIE', winners: candidates};
}
