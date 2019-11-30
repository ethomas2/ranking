export function range(n: number) {
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
