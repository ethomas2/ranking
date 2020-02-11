import React, {useState, useEffect, useRef, useReducer} from 'react';
import {useParams} from 'react-router-dom';
import {
  removeRow,
  removeCol,
  setArr,
  setArr2d,
  range,
  req,
  deepIncludes,
  BackendHttpError,
} from './utils';
import {iteration} from './instantRunoff';
import WithHoverIcon from './WithHoverIcon';
import './App.css';
import {ElectionResponseType} from './types';
import _ from 'lodash';

type State = {
  inFlight: boolean;
  tableBodyData: string[][] | null;
  tableHeaderData: string[] | null;
  tableLeftColData: string[] | null;
  version: string | null;
};

type Action =
  | {type: 'UPDATE_IN_FLIGHT'; inFlight: boolean}
  | {type: 'UPDATE_TABLE_BODY_DATA'; tableBodyData: string[][] | null}
  | {type: 'UPDATE_TABLE_HEADER_DATA'; tableHeaderData: string[] | null}
  | {type: 'UPDATE_TABLE_LEFT_COL_DATA'; tableLeftColData: string[] | null}
  | {type: 'UPDATE_VERSION'; version: string | null}
  | {type: 'UPDATE_ALL'; state: Partial<State>};

const reducer = (prevState: State, action: Action): State => {
  let assertNever: never;
  switch (action.type) {
    case 'UPDATE_IN_FLIGHT':
      return {...prevState, inFlight: action.inFlight};
    case 'UPDATE_TABLE_BODY_DATA':
      return {...prevState, tableBodyData: action.tableBodyData};
    case 'UPDATE_TABLE_HEADER_DATA':
      return {...prevState, tableHeaderData: action.tableHeaderData};
    case 'UPDATE_TABLE_LEFT_COL_DATA':
      return {...prevState, tableLeftColData: action.tableLeftColData};
    case 'UPDATE_VERSION':
      return {...prevState, version: action.version};
    case 'UPDATE_ALL':
      return {...prevState, ...action.state};
    default:
      assertNever = action;
      // TODO: this shouldn't be necessary. Typescript should catch this for you
      return prevState;
  }
};

type MainProps = {
  title: string;
  setElectionWinners: (winners: string[] | null) => void;
};
const Main: React.FC<MainProps> = props => {
  const {title, setElectionWinners} = props;

  const {id} = useParams();

  const [state, dispatch] = useReducer<React.Reducer<State, Action>>(
    reducer,
    {
      tableBodyData: null,
      tableHeaderData: null,
      tableLeftColData: null,
      version: null,
      inFlight: false,
    },
    undefined,
  );

  const {
    tableBodyData,
    tableHeaderData,
    tableLeftColData,
    version,
    inFlight,
  } = state;

  type IterationResult = {
    data: number[][];
    leftCol: string[];
    highlightIndicies: [number, number][];
    eliminatedRows: number[];
  };
  const [iterationResults, setIterationResults] = useState<
    IterationResult[] | null
  >(null);

  type LoadState =
    | {type: 'success'}
    | {type: 'pending'}
    | {type: 'error'; msg: string};
  const [loadState, setLoadState] = useState<LoadState>({type: 'pending'});

  type ValidationState = string | null;
  const [validationState, setValidationState] = useState<ValidationState>(null);

  const setTableData = (tableBodyData: string[][] | null) =>
    dispatch({type: 'UPDATE_TABLE_BODY_DATA', tableBodyData});
  const setTableHeader = (tableHeaderData: string[] | null) =>
    dispatch({type: 'UPDATE_TABLE_HEADER_DATA', tableHeaderData});
  const setTableLeftCol = (tableLeftColData: string[] | null) =>
    dispatch({type: 'UPDATE_TABLE_LEFT_COL_DATA', tableLeftColData});
  const setVersion = (version: string | null) =>
    dispatch({type: 'UPDATE_VERSION', version});
  const setUpdateInFlight = (inFlight: boolean) =>
    dispatch({type: 'UPDATE_IN_FLIGHT', inFlight});
  const setState = (state: Partial<State>) =>
    dispatch({type: 'UPDATE_ALL', state});

  useEffect(() => {
    req<ElectionResponseType>(`/election/${id}`)
      .then(data => {
        const {
          body: tableBodyData,
          header: tableHeaderData,
          leftCol: tableLeftColData,
          version,
        } = data;
        // problem is when id changes the foloowing 5 state updates don't
        // happen atomically, so you end up with tableData that isn't the right
        // shape for tableheader and tableleftcol
        // options:
        //  disable updating while request is in flight
        //  make this stuff atomic by putting it all on the same piece of state
        setState({
          tableBodyData,
          tableHeaderData,
          tableLeftColData,
          version,
        });
        setLoadState({type: 'success'});
      })
      .catch((error: BackendHttpError) => {
        setLoadState({type: 'error', msg: error.error});
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
      req<{version: string}>(`/election/${id}`, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
        },
        body: JSON.stringify({
          body: tableBodyData,
          header: tableHeaderData,
          leftCol: tableLeftColData,
          version,
          title,
        }),
      })
        .then(({version}) => {
          setUpdateInFlight(false);
          console.log(version);
          setVersion(version);
        })
        .catch((err: BackendHttpError) => {
          console.log(err);
          if (err.versionConflict) {
            setValidationState(
              'Changes not saved. Someone updated or removed this document since your last edit. Please refresh page.',
            );
          }
          setUpdateInFlight(false);
        });
    },
    1500,
    [tableBodyData, tableHeaderData, title, tableLeftColData],
    [id],
  );

  useEffect(() => {
    if (
      tableBodyData === null ||
      tableLeftColData === null ||
      tableBodyData.length === 0 ||
      tableLeftColData.length === 0
    ) {
      setIterationResults(null);
      setElectionWinners(null);
      // data uninitialized
      return;
    }

    const newValidationState = validate();
    setValidationState(newValidationState);
    if (newValidationState !== null) {
      setIterationResults(null);
      setElectionWinners(null);
      return;
    }

    const results: IterationResult[] = [];
    let lastData = {
      data: tableBodyData.map(row => row.map(item => Number(item.trim()))),
      leftCol: tableLeftColData,
    };

    let winners: string[] = [];
    while (true) {
      const result = iteration(lastData.leftCol, lastData.data);
      let assertNever: never;
      if (result.type === 'ELIMINATED') {
        results.push({
          data: lastData.data,
          leftCol: lastData.leftCol,
          highlightIndicies: result.highlightIndicies,
          eliminatedRows: result.eliminatedRows,
        });
        lastData = {data: result.newData, leftCol: result.newCandidates};
      } else if (result.type === 'WINNER') {
        results.push({
          data: lastData.data,
          leftCol: lastData.leftCol,
          highlightIndicies: result.highlightIndicies,
          eliminatedRows: [],
        });
        winners = [result.winner];
        break;
      } else if (result.type === 'TIE') {
        results.push({
          data: lastData.data,
          leftCol: lastData.leftCol,
          highlightIndicies: [],
          eliminatedRows: [],
        });
        winners = result.winners;
        break;
      } else if (result.type === 'INVALID DATA') {
        break;
      } else {
        assertNever = result;
      }
    }

    setIterationResults(results);
    setElectionWinners(winners);
  }, [tableBodyData, tableLeftColData]);

  if (loadState.type === 'error') {
    return <span>{`Error: ${loadState.msg}`}</span>;
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
    if (tableBodyData.length === 0) {
      return null;
    }

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

  const isSaving = isPending || inFlight;
  return (
    <>
      <div className="Main__saving-container">
        {isSaving ? (
          'Saving ...'
        ) : (
          <span className="Main__saved-text">Saved</span>
        )}
      </div>
      <table>
        <thead>{tableHeaderRow}</thead>
        <tbody>{tableBodyRows}</tbody>
      </table>
      {validationState && (
        <span className="Main__validation-msg">{validationState}</span>
      )}
      <div>
        <input value="Add Person" onClick={addPerson} type="button" />
        <input value="Add Book" onClick={addBook} type="button" />
      </div>
      {iterationResults &&
        iterationResults.map(roundResult => (
          <IterationTable
            header={tableHeaderData}
            leftCol={roundResult.leftCol}
            data={roundResult.data}
            highlightIndicies={roundResult.highlightIndicies}
            eliminatedRows={roundResult.eliminatedRows}
          />
        ))}
    </>
  );
};

export default Main;

function useDebouncedEffect(
  fn: () => void,
  wait: number,
  debounceArgs: any[],
  forceArgs?: any[],
) {
  /*
   * @param fn           The function to fire
   * @param wait         Amount of time to wait before firing the function
   * @param debounceArgs The args to debounce on. When these args change, the
   *                     pending function will be replaced by the new function
   * @param forceArgs    If these args change, force the pending function to fire
   *                     before setting the new fn as pending.
   */
  const lastTimer = useRef<[NodeJS.Timeout, () => void] | null>(null);
  const [isPending, setPending] = useState(false);

  useEffect(() => {
    if (!forceArgs) {
      return;
    }
    if (lastTimer.current !== null) {
      const [timerId, fn] = lastTimer.current;
      clearTimeout(timerId);
      setPending(false);
      fn();
    }
  }, forceArgs);

  useEffect(() => {
    setPending(true);
    const timerId = setTimeout(() => {
      fn();
      lastTimer.current = null;
      setPending(false);
    }, wait);
    lastTimer.current = [timerId, fn];
    return () => {
      if (lastTimer.current !== null) {
        const [timerId] = lastTimer.current;
        clearTimeout(timerId);
      }
    };
  }, [...debounceArgs, wait]);

  return isPending;
}

type IterationTableProps = {
  leftCol: string[];
  data: number[][];
  header: string[];
  highlightIndicies: [number, number][];
  eliminatedRows: number[];
};
const IterationTable: React.FC<IterationTableProps> = props => {
  const {leftCol, data, header, highlightIndicies, eliminatedRows} = props;
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

  const tableBodyRows = data.map((row, rowIdx) => {
    const eliminantedClass = eliminatedRows.includes(rowIdx)
      ? 'IterationTable__eliminated-row'
      : '';
    return (
      <tr key={`row-${rowIdx}`} className={eliminantedClass}>
        <td className="IterationTable__body-cell">{leftCol[rowIdx]}</td>
        {row.map((item, colIdx) => {
          const idxTuple = [rowIdx, colIdx];
          const highlightClass = deepIncludes(highlightIndicies, idxTuple)
            ? 'IterationTable__highlight'
            : '';

          return (
            <td
              key={`iteration-table-cell-${rowIdx}-${colIdx}`}
              className={highlightClass}>
              {item}
            </td>
          );
        })}
      </tr>
    );
  });

  return (
    <table className="IterationTable">
      <thead>{tableHeaderRow}</thead>
      <tbody>{tableBodyRows}</tbody>
    </table>
  );
};
