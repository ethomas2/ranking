import React, {useState} from 'react';
import {removeRow, removeCol, setArr, setArr2d, range} from './arrayUtils';
import {runElection, Ballot} from './instantRunoff';
import WithHoverIcon from './WithHoverIcon';
import './App.css';

const defaultTableData = [
  ['1', '3', '1', '2', '1', '3'],
  ['3', '1', '2', '1', '2', '1'],
  ['2', '2', '3', '3', '3', '2'],
];
const defaultTableHeader = [
  'Evan',
  'Michaela',
  'Dave',
  'Linlin',
  'Adrian',
  'G',
];
const defaultTableLeftCol = [
  'Book 1 -- I wanna be the very best like no one ever was',
  'Book 2',
  'Book 3',
];
const MainPage: React.FC = () => {
  const [tableBodyData, setTableData] = useState<string[][]>(defaultTableData);
  const [tableHeaderData, setTableHeader] = useState<string[]>(
    defaultTableHeader,
  );
  const [tableLeftColData, setTableLeftCol] = useState<string[]>(
    defaultTableLeftCol,
  );
  const [electionState, setElectionState] = useState<string[] | null>(null);

  const tableHeaderRow = (
    <tr>
      <th />
      {tableHeaderData.map((item, i) => (
        <th key={`header-${i}`}>
          <WithHoverIcon
            onClick={() => {
              setTableData(removeCol(tableBodyData, i));
              setTableHeader(removeRow(tableHeaderData, i));
            }}>
            <input
              type="text"
              size={4}
              value={item}
              onChange={e =>
                setTableHeader(setArr(tableHeaderData, i, e.target.value))
              }
            />
          </WithHoverIcon>
        </th>
      ))}
    </tr>
  );

  const tableBodyRows = tableBodyData.map((row, rowIdx) => (
    <tr key={`row-${rowIdx}`}>
      <td>
        <WithHoverIcon
          onClick={() => {
            setTableData(removeRow(tableBodyData, rowIdx));
            setTableLeftCol(removeRow(tableLeftColData, rowIdx));
          }}>
          <textarea
            value={tableLeftColData[rowIdx]}
            onChange={e =>
              setTableLeftCol(setArr(tableLeftColData, rowIdx, e.target.value))
            }
          />
        </WithHoverIcon>
      </td>
      {row.map((item, colIdx) => (
        <td key={`cell-${rowIdx}-${colIdx}`} className="Table__td-cell">
          <input
            size={1}
            type="text"
            className="Table__input-cell"
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

  const addPerson = () => {
    // TODO: all these modifications of state that reference state should use
    // callback form of setState
    const npeople = tableHeaderData.length;
    setTableHeader(tableHeaderData.concat([`Person - ${npeople}`]));
    setTableData(tableBodyData.map((row, i) => row.concat(`${i + 1}`)));
  };

  const addBook = () => {
    const npeople = tableHeaderData.length;
    const nbooks = tableBodyData.length;
    setTableData(
      tableBodyData.concat([range(npeople).map(() => `${nbooks + 1}`)]),
    );
    setTableLeftCol(tableLeftColData.concat([`Book - ${nbooks + 1}`]));
  };

  const onSubmit = () => {
    const ballots: Ballot[] = range(tableHeaderData.length).map(() => ({}));
    for (var rowIdx = 0; rowIdx < tableLeftColData.length; rowIdx++) {
      for (var colIdx = 0; colIdx < tableHeaderData.length; colIdx++) {
        ballots[colIdx][tableLeftColData[rowIdx]] = Number(
          tableBodyData[rowIdx][colIdx],
        );
      }
    }
    setElectionState(runElection(ballots));
  };

  return (
    <>
      <table>
        <thead>{tableHeaderRow}</thead>
        <tbody>{tableBodyRows}</tbody>
      </table>
      <div>
        <input value="Add Person" onClick={addPerson} type="button" />
        <input value="Add Book" onClick={addBook} type="button" />
        <input value="Submit" onClick={onSubmit} type="button" />
      </div>
      <div>{electionState}</div>
    </>
  );
};

export default MainPage;
