import React from 'react';
import Main from './Main';
import SidePanel from './SidePanel';
import HomePage from './HomePage';
import {BrowserRouter as Router, Route} from 'react-router-dom';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <div className="App__gutter">
          <Route path="/election/:id" component={SidePanel} />
        </div>

        <div className="App__center-column">
          <h2 className="App__title-container">
            <span className="App__title-text">Votes on Votes on Votes</span>
          </h2>
          <Route path="/" exact component={HomePage} />
          <Route path="/election/:id" component={Main} />
        </div>

        <div className="App__gutter" />
      </div>
    </Router>
  );
};

export default App;
