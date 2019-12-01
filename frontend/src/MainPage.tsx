import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {removeRow, removeCol, setArr, setArr2d, range, req} from './utils';
import {runElection, Ballot} from './instantRunoff';
import WithHoverIcon from './WithHoverIcon';
import './App.css';

// TODO: rename to election
const MainPage: React.FC = props => {
  const {id} = useParams();

  const [tableBodyData, setTableData] = useState<string[][] | null>(null);
  const [tableHeaderData, setTableHeader] = useState<string[] | null>(null);
  const [tableLeftColData, setTableLeftCol] = useState<string[] | null>(null);
  const [electionState, setElectionState] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  type RespType = {
    body: string[][];
    header: string[];
    leftCol: string[];
  };
  useEffect(() => {
    req<RespType>(`http://localhost:8000/election/${id}`)
      .then(data => {
        const {body, header, leftCol} = data;
        setTableData(body);
        setTableHeader(header);
        setTableLeftCol(leftCol);
      })
      .catch(error => {
        setError(`${error}`);
      });
  }, [id]);

  if (error !== null) {
    return <span>`Error: ${error}`</span>;
  }

  if (
    tableBodyData === null ||
    tableHeaderData === null ||
    tableLeftColData === null
  ) {
    return <span>Loading data ...</span>;
  }

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
