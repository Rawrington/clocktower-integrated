import { useState, useRef, forwardRef, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import SOCKET_URL from '../socket_config.js';

import PlayerToken from './PlayerToken';
import GlobalMenus from './GlobalMenus';
import Dialogue from './Dialogue';
import CenterDisplay from './CenterDisplay';
import DraggableNote from './DraggableNote';
import NominationDisplay from './NominationDisplay';
import Settings from './Settings';
import Token from './Token';
import NetworkHandler from './NetworkHandler';
import NightSidebar from './NightSidebar';
import DiscordWakeUp from './DiscordWakeUp';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus, faCloudMoon, faCloudSun } from '@fortawesome/free-solid-svg-icons';

import '../css/App.css';

import bigX from '../assets/x.png';

import { getRole, getFabled, getActiveSpecials } from '../genericFunctions';

import { selectPlayerList } from '../store/slices/players';
import { selectNotesList } from '../store/slices/notes';
import { removeFabled, setGameEndText } from '../store/slices/others';
import { setMenu } from '../store/slices/menu';

// I honestly forgor that Maps were a thing its probably not a problem I hope!

function App() {
  const ref = useRef(null);

  return (
    <>
      <GlobalMenus />
      <Dialogue />
      <DiscordWakeUp
        ref={ref} 
      />
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
      <NightSidebar />
      <Bluffs />
      <Fabled />
      <NightDisplay />
      <AlertDisplay />
      <CountdownDisplay />
      <GameEndDisplay />
      <NetworkHandler />
    </>
  );
}

// small containers to seperate out selector logic - more efficient rerendering!
const NoteList = forwardRef((props, ref) => {
  const noteList = useSelector(state => state.notes);
  const players = useSelector(state => state.players);
  const privilegeLevel = useSelector(state => state.privilege);
  const stGrim = useSelector(state => state.others.st);
  const showStGrim = useSelector(state => state.others.stshow);
  const me = useSelector(state => state.me);
  const gameId = useSelector(state => state.game);

  const [lastSpecials, setLastSpecials] = useState({})

  const { sendJsonMessage } = useWebSocket(
    SOCKET_URL,
    {
      filter: () => {
        return false; //we do not care about ANY incoming messages we need to send them!
      },
      share: true,
    }
  );

  useEffect(() => {
    if (privilegeLevel > 0) {
      const mappedNotes = noteList.map((note) => {
        let playerId = -1;
        let closestDistance = -1;

        for (const player of players) {
          const distSqr = ((player.x - note.position.x) * (player.x - note.position.x)) + ((player.y - note.position.y) * (player.y - note.position.y));

          if (closestDistance == -1 || distSqr < closestDistance) {
            playerId = player.id;
            closestDistance = distSqr;
          }
        }

        return {
          ...note,
          player: playerId,
        }
      });

      //I HATE THIS CODE BUT I DONT WANT TO SPAM THE SERVER, tldr only inform the server if our list of active specials changed

      const previous = {...lastSpecials};

      let change = false;

      players.forEach((player) => {
        const activeSpecials = [...new Set(mappedNotes.filter(
          note => note.player === player.id && getActiveSpecials(player.role, note.reminder).length > 0
        ))].reduce((accumulator, currentValue) => {
          const specials = getActiveSpecials(player.role, currentValue.reminder);

          return accumulator.concat(specials.map(special => special.name));
        }, []);

        if((!previous[player.id] && activeSpecials.length > 0) 
          || (previous[player.id]
            && (
              !previous[player.id].every(item => activeSpecials.includes(item))
              || !activeSpecials.every(item => previous[player.id].includes(item))
            )
          )
        ) {
          sendJsonMessage({
            type: 'setActiveSpecials',
            myId: me,
            gameId: gameId,
            player: player.id,
            activeSpecials: activeSpecials,
          });

          change = true;
        }

        previous[player.id] = activeSpecials;
      });

      if (change) {
        setLastSpecials(previous);
      }
    }
  }, [noteList, players, privilegeLevel, lastSpecials])

  return (
    <>
      { showStGrim && stGrim ? (
        stGrim.notes.map((note) => (
          <DraggableNote
            key={note.id}
            id={note.id}
            storyteller={true}
            ref={ref}
          />
        ))
      ) : (
        noteList.map((note) => (
          <DraggableNote
            key={note.id}
            id={note.id}
            ref={ref}
          />
        ))
      )}
    </>
  );
});

// these wrappers might be unneccesary but i want to avoid checking a bunch of props everytime these change, the main app should basically never rerender that way
const PlayerList = forwardRef((props, ref) => {
  const playerList = useSelector(selectPlayerList, shallowEqual);
  const stGrim = useSelector(state => state.others.st);
  const showStGrim = useSelector(state => state.others.stshow);

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
              storyteller={showStGrim && stGrim}
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
      <div
        className="fabled-content"
        style={{
          height: open && fabledList.length > 5 && ((Math.floor((fabledList.length - 1) / 4) + 1) * 12) + 'vmin',
          width: fabledList.length > 5 ? '48vmin' : (fabledList.length * 12) + 'vmin',
        }}
      >
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
            {privilegeLevel > 0 &&
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
            }
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
  const dayNumber = useSelector(state => state.others.daynumber || 0);

  return (
    <div className="day-night-display">
      <span>{isNight ? ('Night ' + dayNumber) : ('Day ' + dayNumber)}</span>
      <FontAwesomeIcon 
        icon={isNight ? faCloudMoon : faCloudSun}
      />
    </div>
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

function CountdownDisplay() {
  const countdown = useSelector(state => state.nomination.countdown);

  if (!countdown) {
    return null;
  }

  return (
    <div className="vote-countdown">
      <span className="three">3</span>
      <span className="two">2</span>
      <span className="one">1</span>
      <span className="go">GO!</span>
    </div>
  );
}

function GameEndDisplay() {
  const text = useSelector(state => state.others.gameEndText);
  const dispatch = useDispatch();

  useEffect(() => {
    if (text) {
      setTimeout(() => {
        dispatch(setGameEndText(false));
      }, 8000);
    }
  }, [text, dispatch]);

  if (!text) {
    return null;
  }

  return (
    <div className={'game-end ' + text.class}>
      <span>
        {text.text.split('').map((char, i) => (
          <span
            style={{ animationDelay: (i / 5) + 's' }}
            key={i}
          >
            {char}
          </span>
        ))}
      </span>
    </div>
  );
}

export default App;
