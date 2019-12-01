import React from 'react';
import MainPage from './MainPage';
import HomePage from './HomePage';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

const App: React.FC = () => {
  const mainPage = <MainPage />;
  return (
    <div className="App">
      <div className="App__title-container">
        <h2 className="App__title">Votes on Votes on Votes</h2>
      </div>
      <Router>
        <Route path="/" component={HomePage} />
        <Route path="/election/:id" component={MainPage} />
      </Router>
    </div>
  );
};

export default App;
