import React, {useState} from 'react';
import Main from './Main';
import SidePanel, {SidePanelProps} from './SidePanel';
import {BrowserRouter as Router, Route} from 'react-router-dom';

const App: React.FC = () => {
  const [title, setTitle] = useState<string>('Title');
  const [titleEditMode, setTitleEditMode] = useState(false);

  const titleContent = titleEditMode ? (
    <input
      autoFocus
      type="text"
      value={title}
      onChange={e => setTitle(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && setTitleEditMode(false)}
      onBlur={() => setTitleEditMode(false)}
    />
  ) : (
    title
  );

  const [electionWinners, setElectionWinners] = useState<string[] | null>(null);

  return (
    <Router>
      <div className="App">
        <div className="App__row">
          <div className="App__gutter" />
          <h2
            onClick={() => setTitleEditMode(true)}
            className="App__center-column App__title-container">
            {titleContent}
          </h2>
          <div className="App__gutter" />
        </div>

        <div className="App__row">
          <div className="App__gutter">
            {/* TODO: Figure out how to do path=* here and still be able to
            access useParams in SidePanel */}
            <Route
              path="/election/:id"
              component={(props: SidePanelProps) => (
                <SidePanel {...props} title={title} />
              )}
            />
            <Route
              exact
              path="/"
              component={(props: SidePanelProps) => (
                <SidePanel {...props} title={title} />
              )}
            />
          </div>

          <div className="App__center-column">
            <Route
              path="/election/:id"
              render={() => (
                <Main setElectionWinners={setElectionWinners} title={title} />
              )}
            />
          </div>

          <div className="App__gutter App__winner-content">
            <h4> Winner(s): </h4>
            {electionWinners && (
              <>
                <div>
                  {electionWinners.map(winner => (
                    <div key={`winner-${winner}`}>{winner}</div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
