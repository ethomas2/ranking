import React, {useState, useEffect} from 'react';
import './SidePanel.css';
import {useHistory, useParams} from 'react-router-dom';
import {req, BackendHttpError} from './utils';
import {ElectionResponseType} from './types';
import CloseIcon from './CloseIcon';
import _ from 'lodash';

export type SidePanelProps = {
  title: string;
};

const SidePanel: React.FC<SidePanelProps> = props => {
  type Card = {
    id: string;
    title: string;
    date: Date;
  };

  const {title: mainTitle} = props;

  const [cards, setCards] = useState<Card[]>([]);
  const [hoverState, _setHoverState] = useState<{[id: string]: boolean}>({});
  const setHoverState = (id: string, state: boolean) => {
    _setHoverState(currentHoverState => ({...currentHoverState, [id]: state}));
  };

  const history = useHistory();
  const {id: urlId} = useParams();
  const loadData = async () => {
    const data = await req<{elections: ElectionResponseType[]}>('/elections');
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
    return cards;
  };
  useEffect(() => {
    loadData();
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

  const deleteElection = async (id: string) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete election ${id}`,
    );
    if (confirmDelete) {
      await req(`/election/${id}`, {method: 'DELETE'});
      const newCards = await loadData();
      // TODO: consider forcing url id to be number in typescript. Would make
      // this method a lot cleaner
      const loadedIds = newCards.map(({id}) => id).map(Number);

      // using _.max insead of Math.max bc Math.max(...[]) === -Infinity
      const nextBiggestId = _.min(loadedIds.filter(id => id >= Number(urlId)));
      const nextId = nextBiggestId || _.head(loadedIds);

      if (nextId) {
        history.push(`/election/${nextId}`);
      } else {
        history.push('/');
      }
    }
  };

  return (
    <div>
      <input type="button" value="Create New" onClick={createNew} />
      {cards.map(({id, title, date}, idx) => {
        const isCurrentlySelectedCard = urlId === id;
        const className =
          'SidePanel__card' +
          (isCurrentlySelectedCard ? ' SidePanel__card--selected' : '');
        return (
          <div
            key={`side-panel-card-${idx}`}
            className={className}
            onClick={() => chooseCard(id)}
            onMouseOver={() => setHoverState(id, true)}
            onMouseLeave={() => setHoverState(id, false)}>
            <div className="SidePanel__card-vert-gutter">
              {hoverState[id] && (
                <CloseIcon
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    deleteElection(id);
                  }}
                  className="SidePanel__close-icon"
                />
              )}
            </div>
            <div className="SidePanel__card-middle">
              <div>
                {(isCurrentlySelectedCard && mainTitle) || title || 'No Title'}
              </div>
              <div>{date.toLocaleDateString()}</div>
            </div>
            <div className="SidePanel__card-vert-gutter" />
          </div>
        );
      })}
    </div>
  );
};

export default SidePanel;
