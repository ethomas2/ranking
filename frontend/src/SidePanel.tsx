import React from 'react';
import './SidePanel.css';
import {useHistory, useParams} from 'react-router-dom';

const SidePanel: React.FC = () => {
  type Card = {
    id: number;
    title: string;
    date: Date;
  };
  const cards: Card[] = [
    {id: 0, title: 'Title 0', date: new Date()},
    {id: 1, title: 'Title 1', date: new Date()},
  ];

  const history = useHistory();
  const {id: urlId} = useParams();
  if (urlId === undefined) {
    return null;
  }

  const chooseCard = (cardId: number) => {
    history.push(`/election/${cardId}`);
  };

  return (
    <div>
      {cards.map(({id, title, date}, idx) => {
        const className =
          'SidePanel__card' +
          (Number(urlId) === id ? ' SidePanel__card--selected' : '');
        return (
          <div
            key={`side-panel-card-${idx}`}
            className={className}
            onClick={() => chooseCard(id)}>
            <div>{title}</div>
            <div>{date.toLocaleDateString()}</div>
          </div>
        );
      })}
    </div>
  );
};

export default SidePanel;
