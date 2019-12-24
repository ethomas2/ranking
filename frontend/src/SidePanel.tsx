import React, {useState, useEffect} from 'react';
import './SidePanel.css';
import {useHistory, useParams} from 'react-router-dom';
import {req, BackendHttpError} from './utils';
import {ElectionResponseType} from './types';
import _ from 'lodash';

const SidePanel: React.FC = () => {
  type Card = {
    id: string;
    title: string;
    date: Date;
  };

  const [cards, setCards] = useState<Card[]>([]);

  const history = useHistory();
  const {id: urlId} = useParams();
  useEffect(() => {
    req<{elections: ElectionResponseType[]}>(`/elections`).then(data => {
      const {elections} = data;
      const cards: Card[] = _.chain(elections)
        .map(({id, title}) => ({
          id,
          title,
          date: new Date(),
        }))
        .sortBy(({id}) => -1 * Number(id))
        .value();

      setCards(cards);
    });
  }, [urlId]);

  const chooseCard = (cardId: string) => {
    history.push(`/election/${cardId}`);
  };

  const createNew = () => {
    req<{id: number}>('/elections', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    })
      .then(result => history.push(`/election/${result.id}`))
      .catch((err: BackendHttpError) => alert(err.error));
  };

  return (
    <div>
      <input type="button" value="Create New" onClick={createNew} />
      {cards.map(({id, title, date}, idx) => {
        const className =
          'SidePanel__card' +
          (urlId === id ? ' SidePanel__card--selected' : '');
        return (
          <div
            key={`side-panel-card-${idx}`}
            className={className}
            onClick={() => chooseCard(id)}>
            <div>{title || 'No Title'}</div>
            <div>{date.toLocaleDateString()}</div>
          </div>
        );
      })}
    </div>
  );
};

export default SidePanel;
