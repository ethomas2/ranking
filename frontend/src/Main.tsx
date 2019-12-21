import React, {useState, useEffect, useCallback, useRef} from 'react';
import {useParams} from 'react-router-dom';
import {removeRow, removeCol, setArr, setArr2d, range, req} from './utils';
import {iteration} from './instantRunoff';
import WithHoverIcon from './WithHoverIcon';
import './App.css';
import {ElectionResponseType} from './types';
import _ from 'lodash';

type MainProps = {
  title: string;
};
const Main: React.FC<MainProps> = props => {
  const {title} = props;

  const {id} = useParams();

  const [updateInFlight, setUpdateInFlight] = useState(false);
  const [tableBodyData, setTableData] = useState<string[][] | null>(null);
  const [tableHeaderData, setTableHeader] = useState<string[] | null>(null);
  const [tableLeftColData, setTableLeftCol] = useState<string[] | null>(null);

  type IterationResult = {
    data: number[][];
    leftCol: string[];
  };
  const [iterationResults, setIterationResults] = useState<
    IterationResult[] | null
  >(null);

  const [electionWinners, setElectionWinners] = useState<string[] | null>(null);
  type LoadState =
    | {type: 'success'}
    | {type: 'pending'}
    | {type: 'error'; msg: string};
  const [loadState, setLoadState] = useState<LoadState>({type: 'pending'});

  type ValidationState = string | null;
  const [validationState, setValidationState] = useState<ValidationState>(null);

  useEffect(() => {
    req<ElectionResponseType>(`http://localhost:8000/election/${id}`)
      .then(data => {
        const {body, header, leftCol} = data;
        setTableData(body);
        setTableHeader(header);
        setTableLeftCol(leftCol);
        setLoadState({type: 'success'});
      })
      .catch(err => {
        setLoadState({type: 'error', msg: `${err}`});
      });
  }, [id]);

  const isPending = useDebouncedEffect(
    () => {
      if (loadState.type !== 'success') {
        // Important so that we don't launch a PUT and overwrite data when we
        // switch from one election to another
        return;
      }

      if (
        tableBodyData === null ||
        tableHeaderData === null ||
        tableLeftColData === null
      ) {
        // When state first loads everything will be null. Don't save that to
        // backend. This shouldn't be necessary since we've already checked for
        // loadState === success, but it makes me feel better, and also makes
        // sure whe know the types of these things are non-null further
        return;
      }

      setUpdateInFlight(true);
      req(`http://localhost:8000/election/${id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
        },
        body: JSON.stringify({
          body: tableBodyData,
          header: tableHeaderData,
          leftCol: tableLeftColData,
          title: title,
        }),
      })
        .then(() => setUpdateInFlight(false))
        .catch(err => console.log(err));
    },
    1500,
    [tableBodyData, tableHeaderData, title, tableLeftColData, id],
  );

  if (loadState.type === 'error') {
    return <span>`error: ${loadState}`</span>;
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
              size={6}
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
            tabIndex={colIdx * tableLeftColData.length + rowIdx + 1}
            size={1}
            type="text"
            value={item}
            onChange={e =>
              setTableData(
                setArr2d(tableBodyData, rowIdx, colIdx, e.target.value),
              )
            }
            onKeyDown={e => {
              // quite the hack
              if (e.key === 'Enter') {
                const myTabIdx = colIdx * tableLeftColData.length + rowIdx + 1;
                const nextElement = document.querySelector(
                  `input[tabIndex="${myTabIdx + 1}"]`,
                );
                nextElement && (nextElement as any).focus();
              }
            }}
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

  const validate = (): ValidationState => {
    // each row must have exactly numbers 1 - n where n is length of table

    const tableTranspose = _.unzip(tableBodyData);
    const ncols = tableHeaderData.length;
    const nrows = tableBodyData.length;
    for (let colIdx = 0; colIdx < ncols; colIdx++) {
      const column = tableTranspose[colIdx];
      const colSet = new Set(
        column.map(item => Number(item.trim())).filter(x => !Number.isNaN(x)),
      );
      if (!_.range(1, nrows + 1).every(x => colSet.has(x))) {
        return `"${tableHeaderData[colIdx]}" must have each number 1-${nrows} exactly once`;
      }
    }
    return null;
  };

  const onSubmit = () => {
    // TODO: validate data. Needs to be all numbers and all in range [1, N]
    const newValidationState = validate();
    setValidationState(newValidationState);
    if (newValidationState !== null) {
      setIterationResults(null);
      setElectionWinners(null);
      return;
    }

    const results: IterationResult[] = [
      {
        leftCol: tableLeftColData,
        data: tableBodyData.map(row => row.map(item => Number(item.trim()))),
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

    setIterationResults(results);
    setElectionWinners(winners);
  };

  const isSaving = isPending || updateInFlight;
  return (
    <>
      <div>
        <span className="App__saving-indicator">
          {isSaving ? 'Saving ...' : 'Saved'}
        </span>
      </div>
      <table>
        <thead>{tableHeaderRow}</thead>
        <tbody>{tableBodyRows}</tbody>
      </table>
      {validationState && (
        <span className="Main__validationMsg">{validationState}</span>
      )}
      <div>
        <input value="Add Person" onClick={addPerson} type="button" />
        <input value="Add Book" onClick={addBook} type="button" />
        <input value="Submit" onClick={onSubmit} type="button" />
      </div>
      {iterationResults &&
        iterationResults.map(roundResult => (
          <IterationTable
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

export default Main;

function useDebouncedEffect(fn: () => void, wait: number, args: any[]) {
  const lastTimer = useRef<NodeJS.Timeout | null>(null);
  const [isPending, setPending] = useState(false);

  useEffect(() => {
    setPending(true);
    const timerId = setTimeout(() => {
      fn();
      lastTimer.current = null;
      setPending(false);
    }, wait);
    lastTimer.current = timerId;
    return () => {
      // if the component unmounts before the effect occurs, cancel the effect
      lastTimer.current && clearTimeout(lastTimer.current);
    };
  }, [...args, wait]);

  return isPending;
}

type IterationTableProps = {
  leftCol: string[];
  data: number[][];
  header: string[];
};
const IterationTable: React.FC<IterationTableProps> = props => {
  const {leftCol, data, header} = props;
  const tableHeaderRow = (
    <tr>
      <th />
      {header.map((item, idx) => (
        <th className="IterationTable__header-cell" key={`header-${idx}`}>
          {item}
        </th>
      ))}
    </tr>
  );

  const tableBodyRows = data.map((row, rowIdx) => (
    <tr key={`row-${rowIdx}`}>
      <td className="IterationTable__body-cell">{leftCol[rowIdx]}</td>
      {row.map(item => (
        <td>{item}</td>
      ))}
    </tr>
  ));

  return (
    <table className="IterationTable">
      <thead>{tableHeaderRow}</thead>
      <tbody>{tableBodyRows}</tbody>
    </table>
  );
};
