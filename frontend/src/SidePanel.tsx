import React, {useState, useEffect} from 'react';
import './SidePanel.css';
import {useHistory, useParams} from 'react-router-dom';
import {req} from './utils';
import {ElectionResponseType} from './types';

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
    req<{elections: ElectionResponseType[]}>(
      `http://localhost:8000/elections`,
    ).then(data => {
      const {elections} = data;
      const cards: Card[] = elections.map(({id, title}) => ({
        id,
        title,
        date: new Date(),
      }));
      setCards(cards);
    });
  }, [urlId]);
  if (urlId === undefined) {
    return null;
  }

  const chooseCard = (cardId: string) => {
    history.push(`/election/${cardId}`);
  };

  return (
    <div>
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
