import React, {useState} from 'react';

type PersonName = string;
type Ranking = {
  [book: string]: number;
};
type State = [PersonName, Ranking][]; // TODO: make double array

const ranking1 = {'book 1': 1, 'book 2': 2, 'book 3': 3};
const ranking2 = {'book 1': 3, 'book 2': 2, 'book 3': 1};
const ranking3 = {'book 1': 2, 'book 2': 1, 'book 3': 3};
const defaultState: State = [
  ['person 1', ranking1],
  ['person 2', ranking2],
  ['person 3', ranking3],
];

const addPerson = (
  currentState: Readonly<State>,
  newPersonName: string,
): State => {
  // TODO: this will error if no books exist
  // TODO: only add if newPersonName does not exist in list of people
  // TODO: this looks like a job for useReducer
  // TODO: can we list comprehension this?
  const books = Object.keys(currentState[0][1]);
  let newRanking: Ranking = {};
  let i = 1;
  for (const book of books) {
    newRanking[book] = i;
    i++;
  }
  return [...currentState, [newPersonName, newRanking]];
};

const addBook = (
  currentState: Readonly<State>,
  setState: (s: State) => void,
) => {
  const nbooks = Object.keys(currentState[0][1]).length;
  const newState = [...currentState];
  const newBookName = `Book ${nbooks + 1}`;
  for (const [, ranking] of newState) {
    ranking[newBookName] = nbooks + 1;
  }
  setState(newState);
};

const App: React.FC = () => {
  const [peopleWithRankings, setState] = useState(defaultState);

  // TODO: make sure all people have all the same book keys
  const books = Object.keys(ranking1);

  const tableBodyContent = books.map(book => (
    <tr key={`book-row-${book}`}>
      <td>{book}</td>
      {peopleWithRankings.map(([person, ranking]) => (
        <td key={`book-${book}-person-${person}`}>{ranking[book]}</td>
      ))}
    </tr>
  ));

  const tableHeaderContent = (
    <tr>
      <th />
      {peopleWithRankings.map(([person]) => (
        <th key={`person-${person}`}>{person}</th>
      ))}
      <th>
        <input
          value="Add person"
          type="button"
          onClick={() =>
            setState(addPerson(peopleWithRankings, 'King Phillip'))
          }
        />
      </th>
    </tr>
  );

  return (
    <table>
      <thead>{tableHeaderContent}</thead>
      <tbody>{tableBodyContent}</tbody>
      <tfoot>
        <tr>
          <td>
            <input
              value="Add book"
              type="button"
              onClick={() => addBook(peopleWithRankings, setState)}
            />
          </td>
        </tr>
      </tfoot>
    </table>
  );
};

export default App;
