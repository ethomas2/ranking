import React from 'react';

type PersonName = string;
type Ranking = {
  [book: string]: number;
};

const App: React.FC = () => {
  const ranking1 = {'book 1': 1, 'book 2': 2, 'book 3': 3};
  const ranking2 = {'book 1': 3, 'book 2': 2, 'book 3': 1};
  const ranking3 = {'book 1': 2, 'book 2': 1, 'book 3': 45};
  const peopleWithRankings: [PersonName, Ranking][] = [
    ['person 1', ranking1],
    ['person 2', ranking2],
    ['person 3', ranking3],
  ];

  // TODO: make sure al people have all the same book keys
  const books = Object.keys(ranking1);

  const tableData = books.map(book => (
    <tr>
      <td>{book}</td>
      {peopleWithRankings.map(([, ranking]) => (
        <td>{ranking[book]}</td>
      ))}
    </tr>
  ));

  const tableHeader = (
    <tr>
      <th></th> {/* empty header for the books row */}
      {peopleWithRankings.map(([person]) => (
        <th>{person}</th>
      ))}
    </tr>
  );

  return (
    <table>
      {tableHeader}
      {tableData}
    </table>
  );
};

export default App;
