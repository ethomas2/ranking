import React from 'react';
import MainPage from './MainPage';
import HomePage from './HomePage';
import {BrowserRouter as Router, Route} from 'react-router-dom';

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="App__gutter" />

      <div className="App__center-column">
        <h2 className="App__title-container">
          <span className="App__title-text">Votes on Votes on Votes</span>
        </h2>
        <Router>
          <Route path="/" exact component={HomePage} />
          <Route path="/election/:id" component={MainPage} />
        </Router>
      </div>

      <div className="App__gutter" />
    </div>
  );
};

export default App;
