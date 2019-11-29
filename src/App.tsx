import React, {useState} from 'react';
import logo from './logo.svg';
import './App.css';

const defaultTableData = [
  ['a', 'b', 'c'],
  ['e', 'f', 'g'],
  ['h', 'i', 'j'],
  ['h', 'i', 'j'],
];
const defaultTableLeftCol = [
  'Evan',
  'Adrian',
  'G',
  'Micheala',
  'Dave',
  'Linlin',
];
const App: React.FC = () => {
  // TODO: useArrState might be useful here?
  const [tableBodyData, setTableData] = useState<string[][]>(defaultTableData);
  const [tableHeaderData, setTableHeader] = useState<string[]>([
    'h1',
    'h2',
    'h3',
  ]);
  const [tableLeftColData, setTableLeftCol] = useState<string[]>(
    defaultTableLeftCol,
  );

  // TODO: maybe just use css grid instead of this table stuff. table stuff is
  // verbose
  const tableHeaderContent = (
    <tr>
      {tableHeaderData.map((item, i) => (
        <th key={`header-${i}`}>
          <input
            value={item}
            onChange={e =>
              setTableHeader(setArr(tableHeaderData, i, e.target.value))
            }
          />
        </th>
      ))}
    </tr>
  );

  const tableBodyContent = tableBodyData.map((row, rowIdx) => (
    <tr key={`row-${rowIdx}`}>
      <td>
        <input
          value={tableLeftColData[rowIdx]}
          onChange={e =>
            setTableLeftCol(setArr(tableLeftColData, rowIdx, e.target.value))
          }
        />
      </td>
      {row.map((item, colIdx) => (
        <td key={`cell-${rowIdx}-${colIdx}`}>
          <input
            value={item}
            onChange={e =>
              setTableData(
                setArr2d(tableBodyData, rowIdx, colIdx, e.target.value),
              )
            }
          />
        </td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>{tableHeaderContent}</thead>
      <tbody>{tableBodyContent}</tbody>
    </table>
  );
};

export default App;

function setArr<T>(arr: T[], idx: number, val: T): T[] {
  const copy = [...arr];
  copy[idx] = val;
  return copy;
}

function setArr2d<T>(
  arr: T[][],
  rowIdx: number,
  colIdx: number,
  val: T,
): T[][] {
  const copy = arr.map(row => [...row]);
  copy[rowIdx][colIdx] = val;
  return copy;
}
