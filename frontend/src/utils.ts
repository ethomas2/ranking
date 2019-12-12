export function range(n: number): number[] {
  let arr = [];
  for (var i = 0; i < n; i++) {
    arr.push(i);
  }
  return arr;
}

export function removeRow<T>(arr: T[], idx: number): T[] {
  const copy = [...arr];
  copy.splice(idx, 1);
  return copy;
}

export function removeCol<T>(arr: T[][], idx: number): T[][] {
  const copy = arr.map(row => [...row]);
  return copy.map(row => {
    row.splice(idx, 1);
    return row;
  });
}

export function setArr<T>(arr: T[], idx: number, val: T): T[] {
  const copy = [...arr];
  copy[idx] = val;
  return copy;
}

export function setArr2d<T>(
  arr: T[][],
  rowIdx: number,
  colIdx: number,
  val: T,
): T[][] {
  const copy = arr.map(row => [...row]);
  copy[rowIdx][colIdx] = val;
  return copy;
}

export function req<T>(url: string, options?: RequestInit): Promise<T> {
  return fetch(url, options).then(resp => (resp.json() as unknown) as T);
}

export function excludeIndicies<T>(arr: readonly T[], indicies: number[]) {
  // TODO: n**2. Do you care?
  return arr.filter((item, idx) => !indicies.includes(idx));
}

export function rankNTallies(k: number, data: number[][]): number[] {
  /**
   * TODO: rename to numItemPerRow<T>(item: T, data: T[][]): number[] ?
   * Given a 2d array and some number k, calculate the for each row of the 2d array
   * how many times does the number k appear. For example given the 2d array.

   * data =  1,  1,  1,
   *         2,  3,  2,
   *         3,  2,  4,
   *         4,  4,  3,

   * rankNtallies(1, data) -> [3, 0, 0, 0]
   * rankNtallies(2, data) -> [0, 2, 1, 0]
   * rankNtallies(3, data) -> [0, 1, 1, 1]
   * rankNtallies(4, data) -> [0, 0, 1, 2]

   * It's useful to visualize the result of rankNtallies as a column vector. I.e

   * rankNtallies(1, data) -> 3,
   *                          0,
   *                          0,
   *                          0,
   */

  const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  return data
    .map(row => row.map(item => item === k))
    .map(row => sum(row.map(Number)));
}

export function enumerate<T>(arr: readonly T[]): [number, T][] {
  return arr.map((item, idx) => [idx, item]);
}

export function justify(arr: number[]): number[] {
  /*
   * Given an array of numbers, return a new array of numbers where each entry
   * is the ranking of that number in the original array. I.e.
   * justify([101, 100, 250]) -> [2, 1, 3]
   */
  const sorted = [...arr].sort();
  return arr.map(item => sorted.indexOf(item) + 1);
}
