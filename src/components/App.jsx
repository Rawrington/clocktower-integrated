import { useState, useRef, forwardRef, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import SOCKET_URL from '../socket_config.js';

import PlayerToken from './PlayerToken';
import GlobalMenus from './GlobalMenus';
import CenterDisplay from './CenterDisplay';
import DraggableNote from './DraggableNote';
import NominationDisplay from './NominationDisplay';
import Settings from './Settings';
import Token from './Token';
import NetworkHandler from './NetworkHandler';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus, faCloudMoon, faCloudSun } from '@fortawesome/free-solid-svg-icons';

import '../css/App.css';

import bigX from '../assets/x.png';

import { getRole, getFabled } from '../genericFunctions';

import { selectPlayerList } from '../store/slices/players';
import { selectNotesList } from '../store/slices/notes';
import { removeFabled } from '../store/slices/others';
import { setMenu } from '../store/slices/menu';

// I honestly forgor that Maps were a thing its probably not a problem I hope!

function App() {
  const ref = useRef(null);

  return (
    <>
      <GlobalMenus />
      <div
        className="town"
        ref={ref}
      >
        <Nomination />
        <NoteList
          ref={ref}
        />
        <PlayerList 
          ref={ref}
        />
        <CenterDisplay />
      </div>
      <Settings />
      <Bluffs />
      <Fabled />
      <NightDisplay />
      <AlertDisplay />
      <NetworkHandler />
    </>
  );
}

// small containers to seperate out selector logic - more efficient rerendering!
const NoteList = forwardRef((props, ref) => {
  const noteList = useSelector(selectNotesList, shallowEqual);

  return (
    <>
      {noteList.map((note) => (
        <DraggableNote
          key={note}
          id={note}
          ref={ref}
        />
      ))}
    </>
  );
});

// these wrappers might be unneccesary but i want to avoid checking a bunch of props everytime these change, the main app should basically never rerender that way
const PlayerList = forwardRef((props, ref) => {
  const playerList = useSelector(selectPlayerList, shallowEqual);

  return (
    <>
      {playerList.length > 0 &&
        <ul>
          {playerList.map((id, i) => (
            <PlayerToken
              key={id}
              order={i}
              id={id}
              sizing={playerList.length}
              ref={ref}
            />
          ))}
        </ul>
      }
    </>
  );
});

function Nomination() {
  const nominationsOpen = useSelector(state => state.nomination.nominated && !isNaN(state.nomination.nominated.index));

  return (
    <>
      {nominationsOpen &&
        <NominationDisplay />
      }
    </>
  );
}

function Bluffs() {
  const [open, setOpen] = useState(true);

  const bluffs = useSelector(state => state.others.bluffs);

  const dispatch = useDispatch();

  return (
    <div className={open ? 'bluffs open' : 'bluffs'}>
      <div
        className="bluffs-plus-minus"
        onClick={() => {
          setOpen(open => !open);
        }}
      >
        <FontAwesomeIcon icon={open ? faMinus : faPlus} />
      </div>
      <h3>Demon Bluffs</h3>
      <div className="bluffs-content">
        {bluffs.map((bluff, i) => (
          <div
            className="token-container"
            key={i}
          >
            <Token
              key={i}
              role={getRole(bluff)}
              description="right"
              click={() => {
                console.log(-i - 1);
                dispatch(setMenu({
                  menu: 'setToken',
                  target: -i - 1,
                }))
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Fabled() {
  const [open, setOpen] = useState(true);

  const fabledList = useSelector(state => state.others.fabled);
  const privilegeLevel = useSelector(state => state.privilege);
  const me = useSelector(state => state.me);
  const gameId = useSelector(state => state.game);

  const { sendJsonMessage } = useWebSocket(
    SOCKET_URL,
    {
      filter: () => {
        return false; //we do not care about ANY incoming messages we need to send them!
      },
      share: true,
    }
  );

  const dispatch = useDispatch();

  if (fabledList.length < 1) {
    return <></>
  }

  return (
    <div className={open ? 'fabled-display open' : 'fabled-display'}>
      <div className="fabled-content">
        {fabledList.map((fabled, i) => (
          <div
            className="token-container"
            key={i}
          >
            <Token
              key={i}
              role={getFabled(fabled)}
              description="right"
            />
            <div
              className="fabled-remove"
              onClick={() => {
                if(privilegeLevel > 0) {
                  dispatch(removeFabled(fabled));

                  sendJsonMessage({
                    type: 'setFabled',
                    myId: me,
                    gameId: gameId,
                    fabled: fabledList.filter(f => f !== fabled),
                  });
                }
              }}
              style={{
                backgroundImage: 'url(' + bigX + ')'
              }}
            ></div>
          </div>
        ))}
      </div>
      <h3>Fabled</h3>
      <div
        className="fabled-plus-minus"
        onClick={() => {
          setOpen(open => !open);
        }}
      >
        <FontAwesomeIcon icon={open ? faMinus : faPlus} />
      </div>
    </div>
  );
}

function NightDisplay() {
  const isNight = useSelector(state => state.night);

  return (
    <FontAwesomeIcon
      className="day-night-display"
      icon={isNight ? faCloudMoon : faCloudSun}
    />
  );
}

function AlertDisplay() {
  const [ lastAlert, setLastAlert ] = useState('');

  const alert = useSelector(state => state.others.alert);

  useEffect(() => {
    setLastAlert(alert);
  }, [alert]);

  if (lastAlert !== alert || !alert) {
    return null;
  }

  return (
    <div className="storyteller-alert">
      { alert.toString() }
    </div>
  );
}

export default App;
