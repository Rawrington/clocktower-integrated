import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import SOCKET_URL from '../socket_config.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear, faClock, faQuestion, faBookOpen, faUsers } from '@fortawesome/free-solid-svg-icons';

import { updateSettings } from '../store/slices/settings';
import { setMenu, closeMenu } from '../store/slices/menu';
import { setNight } from '../store/slices/night';
import { clearNotes } from '../store/slices/notes';
import { incrementDay } from '../store/slices/others';

import '../css/Settings.css';

function Settings() {
  const timerPaused = useSelector(state => typeof state.timer === 'string');
  const [subMenu, setSubMenu] = useState({
      name: 'Help',
      type: 'help',
    });
  const userSettings = useSelector(state => state.settings);
  const privilegeLevel = useSelector(state => state.privilege);
  const isNight = useSelector(state => state.night);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const dispatch = useDispatch();

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

  if(privilegeLevel !== 1 && subMenu.type !== 'help') {
    setSubMenu({
      name: 'Help',
      type: 'help',
    });
  }

  useEffect(() => {
    function handleKeyUp(event) {
      if (event.key.toLowerCase() === 'r') {
        dispatch(setMenu({
          menu: 'showRoles',
          target: -1,
        }))
      }

      if (event.key.toLowerCase() === 'n') {
        dispatch(setMenu({
          menu: 'showNightOrder',
          target: -1,
        }))
      }

      if (event.key.toLowerCase() === 'v') {
        dispatch(setMenu({
          menu: 'showVotingHistory',
          target: -1,
        }))
      }
    }

    window.addEventListener('keyup', handleKeyUp);

    return (() => {
      window.removeEventListener('keyup', handleKeyUp);
    });
  }, [dispatch])

  return (
    <div className={settingsOpen ? ('settings-menu settings-open') : ('settings-menu')}>
      <div
        className="settings-popout"
        onClick={() => {
          setSettingsOpen(settingsOpen => !settingsOpen);
        }}
      >
        <FontAwesomeIcon icon={faGear} />
      </div>
      <h3>{ subMenu.name }</h3>
      <div className="settings-content">
        <ul className="menu-select">
          <li
            className={ subMenu.type === 'help' ? 'selected' : '' }
            onClick={() => {
              if(!settingsOpen) {
                setSettingsOpen(true);
              }

              setSubMenu({
                name: 'Help',
                type: 'help',
              });
            }}
          >
            <FontAwesomeIcon icon={faQuestion} />
          </li>
          {privilegeLevel == 1 &&
            <>
              <li
                className={ subMenu.type === 'setup' ? 'selected' : '' }
                onClick={() => {
                  if(!settingsOpen) {
                    setSettingsOpen(true);
                  }

                  setSubMenu({
                    name: 'Game Setup',
                    type: 'setup',
                  });
                }}
              >
                <FontAwesomeIcon icon={faBookOpen} />
              </li>
              <li
                className={ subMenu.type === 'timer' ? 'selected' : '' }
                onClick={() => {
                  if(!settingsOpen) {
                    setSettingsOpen(true);
                  }

                  setSubMenu({
                    name: 'Timer Settings',
                    type: 'timer',
                  });
                }}
              >
                <FontAwesomeIcon icon={faClock} />
              </li>
              <li
                className={ subMenu.type === 'game' ? 'selected' : '' }
                onClick={() => {
                  if(!settingsOpen) {
                    setSettingsOpen(true);
                  }

                  setSubMenu({
                    name: 'Game Management',
                    type: 'game',
                  });
                }}
              >
                <FontAwesomeIcon icon={faUsers} />
              </li>
            </>
          }
        </ul>
        {subMenu.type === 'help' &&
          <HelpMenu />
        }
        {subMenu.type === 'setup' &&
          <SetupMenu
            me={me}
            gameId={gameId}
            sendJsonMessage={sendJsonMessage} 
          />
        }
        {subMenu.type === 'timer' &&
          <TimerMenu
            userSettings={userSettings}
            timerPaused={timerPaused}
            me={me}
            gameId={gameId}
            sendJsonMessage={sendJsonMessage}
          />
        }
        {subMenu.type === 'game' &&
          <GameMenu
            userSettings={userSettings}
            isNight={isNight}
            me={me}
            gameId={gameId}
            sendJsonMessage={sendJsonMessage}
          />
        }
      </div>
    </div>
  );
}

function TimerMenu({ userSettings, timerPaused, me, gameId, sendJsonMessage }) {
  const dispatch = useDispatch();

  return (
    <ul>
      <li
        onClick={() => {
          dispatch(setMenu({
            menu: 'setDefaultTimer',
            target: -1,
          }));
        }}
      >
        <span className="left-setting">Change Default Timer:</span>
        <span className="right-setting">[{('0' + userSettings.timerMinutes).slice(-2)}:{('0' + userSettings.timerSeconds).slice(-2)}]</span>
      </li>
      <li
        onClick={() => {
          dispatch(updateSettings({
            pauseTimerDuringNom: !userSettings.pauseTimerDuringNom,
          }));
        }}
      >
        <span className="left-setting">Pause Timer during Nominations:</span>
        <span className="right-setting">{userSettings.pauseTimerDuringNom ? ('[On]') : ('[Off]')}</span>
      </li>
      <li
        onClick={() => {
          if(timerPaused) {
            sendJsonMessage({
              type: 'resumeTimer',
              myId: me,
              gameId: gameId,
            });
          }
          else {
            sendJsonMessage({
              type: 'pauseTimer',
              myId: me,
              gameId: gameId,
            });
          }
        }}
      >
        {timerPaused ? 'Resume Current Timer' : 'Pause Current Timer'}
      </li>
    </ul>
  );
}

function GameMenu({ userSettings, isNight, me, gameId, sendJsonMessage }) {
  const dispatch = useDispatch();
  
  return (
    <ul>
      <li
        onClick={() => {
          dispatch(updateSettings({
            moveOnDiscord: !userSettings.moveOnDiscord,
          }));
        }}
      >
        <span className="left-setting">Move Players on Discord when changing time:</span>
        <span className="right-setting">{userSettings.moveOnDiscord ? ('[On]') : ('[Off]')}</span>
      </li>
      <li
        onClick={() => {
          dispatch(setNight(!isNight));

          if(isNight === false) {
            dispatch(incrementDay());
          }

          sendJsonMessage({
            type: 'setNight',
            myId: me,
            gameId: gameId,
            night: !isNight,
            discord: userSettings.moveOnDiscord,
          })
        }}
      >
        {isNight ? 'Change to Day Phase' : 'Go to Night Phase'}
      </li>
      <li
        onClick={() => {
          sendJsonMessage({
            type: 'storytellerAlert',
            myId: me,
            gameId: gameId,
            alert: 'The Storyteller has requested your presence in the town square!',
          })
        }}
      >
        Request Players in Town Square
      </li>
      <li
        onClick={() => {
          sendJsonMessage({
            type: 'summonToTown',
            myId: me,
            gameId: gameId,
            alert: 'WARNING: You will be moved the Town Square shortly!',
          })
        }}
      >
        Summon Players to Town Square Channel
      </li>
      <li
        onClick={() => {
          const alert = window.prompt("Enter your custom alert.");

          if (!alert) {
            return;
          }

          sendJsonMessage({
            type: 'storytellerAlert',
            myId: me,
            gameId: gameId,
            alert: alert,
          })
        }}
      >
        Send Custom Alert
      </li>
    </ul>
  );
}

function SetupMenu({ me, gameId, sendJsonMessage }) {
  const dispatch = useDispatch();

  return (
    <ul>
      <li
        onClick={() => {
          dispatch(setMenu({
            menu: 'setEdition',
            target: -1,
          }));
        }}
      >
        Set Edition
      </li>
      <li
        onClick={() => {
          dispatch(setMenu({
            menu: 'setupMenu',
            target: -1,
          }));
        }}
      >
        Setup & Assign Roles
      </li>
      <li
        onClick={() => {
          dispatch(setMenu({
            menu: 'addFabled',
            target: -1,
          }));
        }}
      >
        Add Fabled
      </li>
      <li
        onClick={() => {
          sendJsonMessage({
            type: 'assignRoles',
            myId: me,
            gameId: gameId,
            sendRolesToPlayers: true,
          })
        }}
      >
        Send out current roles to players.
      </li>
      <li
        onClick={() => {
          sendJsonMessage({
            type: 'clearVotingHistory',
            myId: me,
            gameId: gameId,
          });
        }}
      >
        Clear Voting History
      </li>
      <li
        onClick={() => {
          sendJsonMessage({
            type: 'resetGame',
            myId: me,
            gameId: gameId,
          });
        }}
      >
        Reset Game (RESETS THE ENTIRE GAME STATE)
      </li>
    </ul>
  );
}

function HelpMenu() {
  const dispatch = useDispatch();

  return (
    <ul>
      <li
        onClick={() => {
          dispatch(setMenu({
            menu: 'showRoles',
            target: -1,
          }));
        }}
      >
        Show Roles (R)
      </li>
      <li
        onClick={() => {
          dispatch(setMenu({
            menu: 'showNightOrder',
            target: -1,
          }));
        }}
      >
        Show Night Order (N)
      </li>
      <li
        onClick={() => {
          dispatch(setMenu({
            menu: 'showVotingHistory',
            target: -1,
          }));
        }}
      >
        Show Voting History (V)
      </li>
      <li
        onClick={() => {
          dispatch(clearNotes());
        }}
      >
        Clear Personal Notes
      </li>
    </ul>
  );
}

export default Settings;