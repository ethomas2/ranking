import React from 'react';
import {useHistory} from 'react-router-dom';

function req<T>(url: string, options: RequestInit): Promise<T> {
  return fetch(url, options).then(resp => (resp.json() as unknown) as T);
}

const HomePage: React.FC = () => {
  const history = useHistory();
  const createNew = async () => {
    const result = await req<{id: number}>('http://localhost:8000/election', {
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
