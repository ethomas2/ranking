import React from 'react';
import './SidePanel.css';
import {useHistory} from 'react-router-dom';

type Card = {
  id: number;
  title: string;
  date: Date;
};

const SidePanel: React.FC = () => {
  const cards: Card[] = [
    {id: 0, title: 'title 1', date: new Date()},
    {id: 1, title: 'title 1', date: new Date()},
  ];
  const history = useHistory();
  const chooseCard = (cardId: number) => {
    history.push(`/election/${cardId}`);
  };

  return (
    <div>
      {cards.map(({id, title, date}, idx) => {
        return (
          <div
            key={`side-panel-card-${idx}`}
            className="SidePanel__card"
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
