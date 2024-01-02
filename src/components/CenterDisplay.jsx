import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import SOCKET_URL from '../socket_config.js'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserGroup, faUsers, faHeartPulse, faCheckToSlot, faClock } from '@fortawesome/free-solid-svg-icons';

import '../css/CenterDisplay.css';

import { selectAliveCounter, selectVoteCount, clearMarked } from '../store/slices/players';
import { setMenu } from '../store/slices/menu';
import { setNomination, setNominationsOpen } from '../store/slices/nomination';
import { showStorytellerGrim } from '../store/slices/others';

import { getRole } from '../genericFunctions'

import townNumber from '../game.json';

function CenterDisplay() {
  const timer = useSelector(state => state.timer);
  const townsize = useSelector(state => state.players.length);
  const nonTravellers = useSelector(state => state.players.filter(player => !getRole(player.role) || !getRole(player.role).team || getRole(player.role).team !== 'traveler').length);
  const privilegeLevel = useSelector(state => state.privilege);
  const availableVotes = useSelector(selectVoteCount);
  const alivePlayers = useSelector(selectAliveCounter);
  const nominationsOpen = useSelector(state => state.nomination.nominated && !isNaN(state.nomination.nominated.index));

  return (
    <>
      <div
        className="center-display"
        style={{
          opacity: nominationsOpen && 0,
          transform: nominationsOpen && 'translate(-50%, -50%) scale(0.1)',
        }}
      >
        <div className="center-content">
          { nonTravellers >= 5 ? (
            <>
              {/* Town Size */}
              <FontAwesomeIcon
                icon={faUsers}
                className="fa-center-display"
                style={
                  { color: '#00f700' }
                }
              />
              <span>{townsize}</span>
              {/* Alive Players */}
              <FontAwesomeIcon
                icon={faHeartPulse}
                className="fa-center-display"
                style={
                  { color: '#ff4a50' }
                }
              />
              <span>{alivePlayers}</span>
              {/* Available Votes */}
              <FontAwesomeIcon
                icon={faCheckToSlot}
                className="fa-center-display"
                style={
                  { color: '#ffffff' }
                }
              />
              <span>{ availableVotes }</span><br />
              {/* Townsfolk */}
              <FontAwesomeIcon
                icon={faUserGroup}
                className="fa-center-display"
                style={
                  { color: '#1f65ff' }
                }
              />
              <span>{townNumber[nonTravellers - 5].townsfolk}</span>
              {/* Outsiders */}
              <FontAwesomeIcon
                icon={faUser}
                className="fa-center-display"
                style={
                  { color: '#46d5ff' }
                }
              />
              <span>{townNumber[nonTravellers - 5].outsider}</span>
              {/* Minions */}
              <FontAwesomeIcon
                icon={faUser}
                className="fa-center-display"
                style={
                  { color: '#ff6900' }
                }
              />
              <span>{townNumber[nonTravellers - 5].minion}</span>
              {/* Demon */}
              <FontAwesomeIcon
                icon={faUser}
                className="fa-center-display"
                style={
                  { color: '#ce0100' }
                }
              />
              <span>{townNumber[nonTravellers - 5].demon}</span>
            </>
          ) : (
            <span>TOWN NO BIG, Add more players!</span>
          )}
        </div>
        <CenterTimer
          timer={timer}
          privilegeLevel={privilegeLevel}
        />
        <TopDisplay
          privilegeLevel={privilegeLevel}
        />
      </div>
    </>
  );
}

function CenterTimer({ timer, privilegeLevel }) {
  const [displayTime, setDisplayTime] = useState('--:--');

  const dispatch = useDispatch();

  const timerRef = useRef(null);

  function updateDisplay() {
    const diffy = (timer - Date.now()) / 1000;

    const minutes = Math.floor(diffy / 60);

    const seconds = Math.floor(diffy - (minutes * 60));

    // remaining ms
    const remainder = (diffy - (minutes * 60) - seconds) * 1000;

    const display = minutes + ':' + ('0' + seconds).slice(-2);

    if (display != displayTime) {
      setDisplayTime(display);
    }

    if (remainder >= 0) {
      clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        updateDisplay();
      }, Math.ceil(remainder));
    }
  }

  if(typeof timer === 'string') {
    if(timer !== displayTime) {
      setDisplayTime(timer);
    }
  }
  else if (timer > Date.now()) {
    updateDisplay();
  }
  else if (displayTime !== '--:--') {
    setDisplayTime('--:--');
  }

  useEffect(() => {
    if (typeof timer !== 'string' && timer > Date.now()) {
      updateDisplay();
    }
  }, [displayTime, timer]);

  return (
    <>
      <div
        className={'center-timer' + (privilegeLevel == 1 ? ' clickable' : '')}
        onClick={() => {
          if (privilegeLevel > 0) {
            dispatch(setMenu({
              menu: 'setTimer',
              target: -1,
            }));
          }
        }}
      >
        <FontAwesomeIcon
          icon={faClock}
          className="fa-clock-display"
          style={
            { color: '#ffffff' }
          }
        />
        <span>{displayTime}</span>
      </div>
    </>
  );
}

function TopDisplay({ privilegeLevel }) {
  const nomination = useSelector(state => state.nomination, shallowEqual);
  const me = useSelector(state => state.me);
  const gameId = useSelector(state => state.game);
  const canNominate = useSelector(state => !!state.players.filter(player => !player.dead && player.id === me).length);

  const stGrim = useSelector(state => !!state.others.st);
  const showStGrim = useSelector(state => state.others.stshow);

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

  return (
    <div className="button-group">
      {privilegeLevel === 1 ? (
        !nomination.nominating &&
          <>
            <div
              className="button"
              onClick={() => {
                dispatch(setNominationsOpen(!nomination.open));

                sendJsonMessage({
                  type: 'setOpenNoms',
                  myId: me,
                  gameId: gameId,
                  open: !nomination.open,
                });
              }}
            >
              {nomination.open ? 'Close Nominations' : 'Open Nominations'}
            </div>
            {nomination.open &&
              <div
                className="button"
                onClick={() => {
                  dispatch(clearMarked());

                  sendJsonMessage({
                    type: 'clearMarked',
                    myId: me,
                    gameId: gameId,
                  });
                }}
              >
                Clear Execution Mark
              </div>
            }
          </>
      ) : (
        nomination.open && canNominate && !nomination.nominating &&
          <div
            className="button"
            onClick={() => {
              dispatch(setNomination({
                nominating: me,
              }));
            }}
          >
            Nominate
          </div>
      )}
      {nomination.open && nomination.nominating &&
        <div
          className="button"
          onClick={() => {
            dispatch(setNomination({
              nominating: false,
            }));
          }}
        >
          Cancel
        </div>
      }
      {stGrim && 
        <div
          className="button"
          onClick={() => {
            dispatch(showStorytellerGrim(!showStGrim));
          }}
        >
          { showStGrim ? `Hide Storyteller's Grimoire` : `Show Storyteller's Grimoire` }
        </div>
      }
    </div>
  );
}

export default CenterDisplay;

