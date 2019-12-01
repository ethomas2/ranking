import React from 'react';
import MainPage from './MainPage';

const App: React.FC = () => {
  const mainPage = <MainPage />;
  return (
    <div className="App">
      <div className="App__title-container">
        <h2 className="App__title">Votes on Votes on Votes</h2>
      </div>
      {mainPage}
    </div>
  );
};

export default App;
