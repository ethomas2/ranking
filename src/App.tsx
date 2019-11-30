import React, {useState} from 'react';
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
  'Book 1 -- The end of the beggining was the beggining of the end',
  'Book 2',
  'Book 3',
];
const App: React.FC = () => {
  // TODO: useArrState might be useful here?
  const [tableBodyData, setTableData] = useState<string[][]>(defaultTableData);
  const [tableHeaderData, setTableHeader] = useState<string[]>(
    defaultTableHeader,
  );
  const [tableLeftColData, setTableLeftCol] = useState<string[]>(
    defaultTableLeftCol,
  );

  const tableHeaderRow = (
    <tr>
      <th />
      {tableHeaderData.map((item, i) => (
        <th key={`header-${i}`}>
          <WithIcon>
            <input
              type="text"
              size={4}
              value={item}
              onChange={e =>
                setTableHeader(setArr(tableHeaderData, i, e.target.value))
              }
            />
          </WithIcon>
        </th>
      ))}
    </tr>
  );

  const tableBodyRows = tableBodyData.map((row, rowIdx) => (
    <tr key={`row-${rowIdx}`}>
      <td>
        <textarea
          value={tableLeftColData[rowIdx]}
          onChange={e =>
            setTableLeftCol(setArr(tableLeftColData, rowIdx, e.target.value))
          }
        />
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

  return (
    <div className="App">
      <div className="App__title-container">
        <h2 className="App__title">Votes on Votes on Votes</h2>
      </div>
      <table>
        <thead>{tableHeaderRow}</thead>
        <tbody>{tableBodyRows}</tbody>
      </table>
      <div>
        <input value="Add Person" type="button" />
        <input value="Add Book" type="button" />
      </div>
    </div>
  );
};

export default App;

type WithIconProps = {
  children: JSX.Element;
};
const WithIcon: React.FC<WithIconProps> = props => {
  const child = React.Children.only(props.children);
  const [childElm, setChildElm] = useState<Element | null>(null);

  const [mouseOverChild, setMouseOverChild] = useState<boolean>(false);
  const [mouseOverIcon, setMouseOverIcon] = useState<boolean>(false);
  const iconVisible = mouseOverChild || mouseOverIcon;

  const icon = childElm && (
    <img
      src="minus-icon.png"
      alt="no img"
      style={{
        position: 'absolute',
        // I think accessing window attributes in render is a no no
        top: window.scrollY + childElm.getBoundingClientRect().top - 6,
        left: window.scrollX + childElm.getBoundingClientRect().left - 6,
        width: '12px',
        height: '12px',
        display: iconVisible ? 'block' : 'none',
      }}
      onMouseOver={() => setMouseOverIcon(true)}
      onMouseLeave={() => setMouseOverIcon(false)}
    />
  );

  const elm = React.cloneElement(child, {
    onMouseOver: () => setMouseOverChild(true),
    onMouseLeave: () => setMouseOverChild(false),
    ref: (r: Element | null) => setChildElm(r),
  });

  return (
    <>
      {elm}
      {icon}
    </>
  );
};

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
