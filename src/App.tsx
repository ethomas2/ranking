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
          <input value={item} />
        </th>
      ))}
    </tr>
  );
  const tableBodyContent = tableBodyData.map((row, rowIndex) => (
    <tr key={`row-${rowIndex}`}>
      <td>
        <input value={tableLeftColData[rowIndex]} />
      </td>
      {row.map((item, colIndex) => (
        <td key={`cell-${rowIndex}-${colIndex}`}>
          <input value={item} />
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
