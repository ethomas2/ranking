import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {removeRow, removeCol, setArr, setArr2d, range, req} from './utils';
import {iteration} from './instantRunoff';
import WithHoverIcon from './WithHoverIcon';
import './App.css';

// TODO: rename to election
const MainPage: React.FC = props => {
  const {id} = useParams();

  const [tableBodyData, setTableData] = useState<string[][] | null>(null);
  const [tableHeaderData, setTableHeader] = useState<string[] | null>(null);
  const [tableLeftColData, setTableLeftCol] = useState<string[] | null>(null);
  type RoundResult = {
    data: number[][];
    leftCol: string[];
  };
  const [roundResults, setRoundResults] = useState<RoundResult[] | null>(null);
  const [electionWinners, setElectionWinners] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: debounce this and maybe move to it's own hook
    if (
      tableBodyData === null ||
      tableHeaderData === null ||
      tableLeftColData === null
    ) {
      // When state first loads everything will be null. Don't save that to
      // backend
      return;
    }
    req(`http://localhost:8000/election/${id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
      },
      body: JSON.stringify({
        body: tableBodyData,
        header: tableHeaderData,
        leftCol: tableLeftColData,
      }),
    }).catch(err => console.log(err));
  }, [tableBodyData, tableHeaderData, tableLeftColData, id]);

  type GetElectionRespType = {
    body: string[][];
    header: string[];
    leftCol: string[];
  };
  useEffect(() => {
    req<GetElectionRespType>(`http://localhost:8000/election/${id}`)
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
        <td key={`cell-${rowIdx}-${colIdx}`}>
          <input
            size={1}
            type="text"
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
    // TODO: validate data. Needs to be all numbers and all in range [1, N]

    const results: RoundResult[] = [
      {
        leftCol: tableLeftColData,
        data: tableBodyData.map(row => row.map(Number)),
      },
    ];
    let winners: string[] = ['No winners'];

    while (true) {
      const lastResult = results[results.length - 1];
      const newResult = iteration(lastResult.leftCol, lastResult.data);
      if (newResult.type === 'WINNER') {
        winners = [newResult.winner];
        break;
      } else if (newResult.type === 'TIE') {
        winners = newResult.winners;
        break;
      } else {
        results.push({
          leftCol: newResult.newCandidates,
          data: newResult.newData,
        });
      }
    }

    setRoundResults(results);
    setElectionWinners(winners);
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
      {roundResults &&
        roundResults.map(roundResult => (
          <Round
            leftCol={roundResult.leftCol}
            data={roundResult.data}
            header={tableHeaderData}
          />
        ))}
      {electionWinners && (
        <>
          <div> Winners: </div>
          {electionWinners.map(winner => (
            <div>{winner}</div>
          ))}
        </>
      )}
    </>
  );
};

export default MainPage;

type RoundProps = {
  leftCol: string[];
  data: number[][];
  header: string[];
};
const Round: React.FC<RoundProps> = props => {
  const {leftCol, data, header} = props;
  const tableHeaderRow = (
    <tr>
      <th />
      {header.map((item, idx) => (
        <th key={`header-${idx}`}>{item}</th>
      ))}
    </tr>
  );

  const tableBodyRows = data.map((row, rowIdx) => (
    <tr key={`row-${rowIdx}`}>
      <td>{leftCol[rowIdx]}</td>
      {row.map(item => (
        <td>{item}</td>
      ))}
    </tr>
  ));

  return (
    <table>
      <thead>{tableHeaderRow}</thead>
      <tbody>{tableBodyRows}</tbody>
    </table>
  );
};
