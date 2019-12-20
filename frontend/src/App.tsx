import React, {useState} from 'react';
import Main from './Main';
import SidePanel from './SidePanel';
import {BrowserRouter as Router, Route} from 'react-router-dom';

const App: React.FC = () => {
  const [isSaving, setSaving] = useState(false);
  return (
    <Router>
      <div className="App">
        <div className="App__gutter">
          {/* TODO: Figure out how to do path=* here and still be able to
            access useParams in SidePanel */}
          <Route path="/election/:id" component={SidePanel} />
          <Route exact path="/" component={SidePanel} />
        </div>

        <div className="App__center-column">
          <h2 className="App__title-container">
            <span className="App__title-text">Votes on Votes on Votes</span>
          </h2>
          <Route
            path="/election/:id"
            render={props => <Main {...props} setSavingIndicator={setSaving} />}
          />
        </div>

        <div className="App__gutter">
          <span className="App__saving-indicator">
            {isSaving ? 'Saving ...' : 'Saved'}
          </span>
        </div>
      </div>
    </Router>
  );
};

export default App;
