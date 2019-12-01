import React from 'react';
import {useHistory} from 'react-router-dom';

import {req} from './utils';

const HomePage: React.FC = () => {
  const history = useHistory();
  const createNew = async () => {
    const result = await req<{id: number}>('http://localhost:8000/elections', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });
    history.push(`/election/${result.id}`);
  };
  return <input type="button" value="Create New" onClick={createNew} />;
};
export default HomePage;
