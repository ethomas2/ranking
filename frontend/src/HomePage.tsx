import React from 'react';
import {useHistory} from 'react-router-dom';

import {req} from './utils';

const HomePage: React.FC = () => {
  const history = useHistory();
  const createNew = () => {
    req<{id: number}>('http://localhost:8000/elections', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(result => history.push(`/election/${result.id}`))
      .catch(err => alert(err));
  };
  return <input type="button" value="Create New" onClick={createNew} />;
};
export default HomePage;
