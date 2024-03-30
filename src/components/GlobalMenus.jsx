import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import SOCKET_URL from '../socket_config.js';

import { closeMenu, setMenu } from '../store/slices/menu';
import { updatePlayer } from '../store/slices/players';
import { addNote } from '../store/slices/notes';
import { updateSettings } from '../store/slices/settings';
import { addFabled, setBluff, setAlert } from '../store/slices/others';
import { setEdition } from '../store/slices/edition';
import { setQuestion, clearQuestion } from '../store/slices/dialogue';

import '../css/GlobalMenus.css';

import noteBackground from '../assets/reminder.png';
import customNote from '../assets/reminders/custom.png';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX, faTriangleExclamation, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

import { getJinxes, getTravellersNotIn, getSpecial, getRole, getImage, getTown, getGlobalReminders, getReminders, getEdition, getCurrentTravellersWithRole, getFabled, getFabledList, getEditionImage } from '../genericFunctions';

import standardRoles from '../roles.json';
import editions from '../editions.json';
import townNumber from '../game.json';

import Token from './Token';


// Is there a better way to do modal menus? OH GOD THE RETURN PASSING WHY DO I YET STAND
function GlobalMenus() {
  const currentMenu = useSelector(state => state.menu);

  const edition = useSelector(state => state.edition);
  const privilegeLevel = useSelector(state => state.privilege);

  const dispatch = useDispatch();

  if (currentMenu.menu === '') {
    return <></>;
  }

  return (
    <>
      <div className="global-menu-modal">
        <div
          className="global-menu-x"
          onClick={() => {
            dispatch(closeMenu());
          }}
        >
          <FontAwesomeIcon icon={faX} />
        </div>
        {currentMenu.menu === 'addNote' &&
          <AddNote
            target={currentMenu.target}
            edition={edition}
          />
        }
        {currentMenu.menu === 'setToken' &&
          <SetToken
            target={currentMenu.target}
            edition={edition}
            privilegeLevel={privilegeLevel}
          />
        }
        {currentMenu.menu === 'addFabled' && privilegeLevel >= 1 &&
          <AddFabled />
        }
        {currentMenu.menu === 'setTimer' && privilegeLevel >= 1 &&
          <SetTimer
            type={1}
          />
        }
        {currentMenu.menu === 'setDefaultTimer' && privilegeLevel >= 1 &&
          <SetTimer
            type={0}
          />
        }
        {currentMenu.menu === 'showRoles' &&
          <ShowRoles
            edition={edition}
          />
        }
        {currentMenu.menu === 'showNightOrder' &&
          <ShowNightOrder
            edition={edition}
          />
        }
        {currentMenu.menu === 'setupMenu' && privilegeLevel >= 1 &&
          <SetupMenu
            edition={edition}
          />
        }
        {currentMenu.menu === 'showVotingHistory' &&
          <ShowVotingHistory />
        }
        {currentMenu.menu === 'setEdition' && privilegeLevel >= 1 &&
          <EditionMenu />
        }
        {currentMenu.menu === 'uploadCustomEdition' && privilegeLevel >= 1 &&
          <CustomEdition />
        }
      </div>
      <div
        className="global-menu-background"
        onClick={() => {
          dispatch(closeMenu());
        }}
      ></div>
    </>
  );
}

function getPlayerNameById(state, id) {
  const player = state.players.map(player => {
    return {
      id: player.id,
      name: player.name,
    };
  }).find((player) => player.id === id)

  return player && player.name;
}

function getPlayerWithBox(state, id) {
  return state.players.map(player => {
    return {
      id: player.id,
      name: player.name,
      x: player.x,
      y: player.y,
      width: player.width,
      height: player.height,
    };
  }).find((player) => player.id === id);
}

export function NoteOption({ note, reminder, spawnNote }) {
  const reminderImage = getImage(reminder);

  return (
    <>
      <div
        style={{ backgroundImage: 'url(' + noteBackground + ')' }}
        className="note-option"
        onClick={() => {
          if (spawnNote) {
            spawnNote({ reminder: reminder, text: note });
          }
        }}
      >
        {reminder ? (
          <div
            className="note-reminder"
            style={{ backgroundImage: 'url(' + reminderImage + ')' }}
          >
            <div className="note-text">
              <span>{note}</span>
            </div>
          </div>
        ) : (
          <span>{note}</span>
        )}
      </div>
    </>
  );
}

function getPlayerRoles(state) {
  return state.players.map(player => player.role || -1).filter(role => role !== -1);
}

function AddNote({ target, edition }) {
  const roles = useSelector(state => getPlayerRoles(state), shallowEqual);

  const fabled = useSelector(state => state.others.fabled);

  const notes = [...getGlobalReminders(edition), ...getReminders(roles, fabled)];

  const player = useSelector(state => getPlayerWithBox(state, target), shallowEqual);

  const question = useSelector(state => state.dialogue.question);
  const response = useSelector(state => state.dialogue.response);

  const dispatch = useDispatch();

  function spawnNote(note) {
    const pos = {
      x: player.x + (Math.random() * player.width),
      y: player.y + (Math.random() * player.height),
    };

    dispatch(addNote({
      ...note,
      position: pos,
      id: note.reminder + '_' + nanoid(),
      globalIndex: getGlobalReminders(edition).findIndex(reminder => reminder.text === note.text && reminder.reminder === note.reminder),
    }));
    // by giving our note a unique indentifier we force less DOM updates to happen, I think, idk React cool im bad....

    dispatch(closeMenu());
  }

  useEffect(() => {
    if(question === 'Enter a custom note:' && response) {
      spawnNote({ text: response });
      dispatch(clearQuestion());
    }
  }, [question, response, dispatch, spawnNote]);

  return (
    <>
      <h3>Add Note to { player.name }</h3>
      <div className="menu-content menu-add-note scrollable">
        {notes.map((note, i) => (
          <NoteOption
            key={i}
            note={note.text}
            reminder={note.reminder}
            spawnNote={spawnNote}
          />
        ))}
        <div
          style={{ backgroundImage: 'url(' + noteBackground + ')' }}
          className="note-option"
          onClick={() => {
            dispatch(setQuestion('Enter a custom note:'));
          }}>
          <div
            className="note-reminder"
            style={{ backgroundImage: 'url(' + customNote + ')' }}
          >
            <div className="note-text">
              <span> Custom Note </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SetToken({ target, edition, privilegeLevel }) {
  const [travellerMenu, setTravellerMenu] = useState(false);

  // is not a bluff menu and is storyteller to see travellers
  const roles = (target >= 0 && privilegeLevel > 0) ? (travellerMenu ? getTravellersNotIn(edition) : [...getTown(edition, 'traveler'), ...getTown(edition)]) : getTown(edition);

  const dispatch = useDispatch();

  const name = useSelector(state => getPlayerNameById(state, target));
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

  return (
    <>
      <h3>{ target >= 0 ? ('Choose a character for ' + name) : ('Choose a Demon Bluff') }</h3>
      <div className={'menu-content menu-choose-token ' + (roles.length > 32 ? ' scrollable' : '')}>
        {roles.map((role, i) => (
          <div 
            key={i}
            className="token-container"
          >
            <Token
              key={i}
              click={() => {
                if (target < 0) {
                  dispatch(setBluff({
                    id: -(target + 1),
                    bluff: role,
                  }));
                }
                else {
                  dispatch(updatePlayer({
                    id: target,
                    role: role,
                    firstNight: true,
                  }));
                  if(privilegeLevel > 0) {
                    sendJsonMessage({
                      type: 'updatePlayer',
                      myId: me,
                      gameId: gameId,
                      player: {
                        id: target,
                        role: role,
                        traveler: (getRole(role) && getRole(role).team === 'traveler') ? true : false,
                      },
                      reveal: true,
                    });
                  }
                }

                dispatch(closeMenu());
              }}
              role={getRole(role)}
              description={roles.length <= 32 && 'right'}
            />
          </div>
        ))}
        <div
          key={roles.length + 1}
          className="token-container"
        >
          <Token
            key={roles.length + 1}
            click={() => {
              if (target < 0) {
                dispatch(setBluff({
                  id: -(target + 1),
                  bluff: '',
                }));
              }
              else {
                dispatch(updatePlayer({
                  id: target,
                  role: -1,
                }));
                if(privilegeLevel > 0) {
                  sendJsonMessage({
                    type: 'updatePlayer',
                    myId: me,
                    gameId: gameId,
                    player: {
                      id: target,
                      role: -1,
                    }
                  });
                }
              }

              dispatch(closeMenu());
            }}
          />
        </div>
        {privilegeLevel > 0 &&
          <>
            <div className="break"></div>
            <div
              className="button"
              onClick={() => {
                setTravellerMenu(!travellerMenu);
              }}
            >
              {travellerMenu ? ('Show Script Roles'):('Show Off Script Travellers')}
            </div>
          </>
        }
      </div>
    </>
  );
}

function AddFabled() {
  const dispatch = useDispatch();

  const me = useSelector(state => state.me);
  const gameId = useSelector(state => state.game);
  const currentFabled = useSelector(state => state.others.fabled);

  const fabledList = getFabledList().filter(fabled => !currentFabled.includes(fabled.id));

  const { sendJsonMessage } = useWebSocket(
    SOCKET_URL,
    {
      filter: () => {
        return false; //we do not care about ANY incoming messages we need to send them!
      },
      share: true,
    }
  );

  return (
    <>
      <h3>Add a Fabled</h3>
      <div className="menu-content menu-choose-token">
        {fabledList.map((fabled, i) => (
          <div 
            key={i}
            className="token-container"
          >
            <Token
              key={i}
              click={() => {
                dispatch(addFabled(fabled.id));
                
                sendJsonMessage({
                  type: 'setFabled',
                  myId: me,
                  gameId: gameId,
                  fabled: currentFabled.concat(fabled.id),
                });

                dispatch(closeMenu());
              }}
              role={fabled}
              description="right"
            />
          </div>
        ))}
      </div>
    </>
  );
}

function SetTimer({ type }) {
  // type, 0 == DEFAULT TIMER, 1 = NOMINATION TIMER
  const userSettings = useSelector(state => state.settings);

  const [inputMins, setInputMins] = useState(('0' + userSettings.timerMinutes).slice(-2));
  const [inputSecs, setInputSecs] = useState(('0' + userSettings.timerSeconds).slice(-2));

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

  function updateMinutes(event) {
    if(isNaN(event.target.value)) {
      return
    }

    const mins = ('0' + Number(event.target.value)).slice(-2);

    if(Number(mins) > 15) {
      setInputMins(15);
    }
    else {
      setInputMins(mins);
    }
  }

  function updateSeconds(event) {
    if(isNaN(event.target.value)) {
      return
    }

    const secs = ('0' + Number(event.target.value)).slice(-2);

    if(Number(secs) > 59) {
      setInputSecs(59);
    }
    else {
      setInputSecs(secs);
    }
  }

  return (
    <>
      <h3>Set {type == 0 ? ('Default'):('a Nomination')} Timer</h3>
      <div className="menu-content menu-set-timer">
        <span>
          <input
            type="number"
            name="timer"
            value={inputMins}
            onChange={updateMinutes}
          />
          :
          <input
            type="number"
            name="timer"
            value={inputSecs}
            onChange={updateSeconds}
          />
        </span>
        <div
          className="button"
          onClick={() => {
            if (type == 0) {
              //handle default update
              dispatch(updateSettings({
                timerMinutes: Number(inputMins),
                timerSeconds: Number(inputSecs),
              }))
            }
            else {
              sendJsonMessage({
                type: 'startTimer',
                myId: me,
                gameId: gameId,
                minutes: Number(inputMins),
                seconds: Number(inputSecs),
              })
            }
            dispatch(closeMenu())
          }}
        >
          {type == 0 ? ('Set Default Timer to'):('Start Timer of Length')} {inputMins}:{inputSecs}
        </div>
      </div>
    </>
  );
}


function ShowRoles({ edition }) {
  const townsfolk = getTown(edition , 'townsfolk');
  const outsiders = getTown(edition , 'outsider');
  const minions = getTown(edition , 'minion');
  const demons = getTown(edition , 'demon');
  const jinxes = getJinxes(edition);

  return (
    <>
      <h3>Character Reference: {getEdition(edition).name}</h3>
      <div className="menu-content menu-roles scrollable">
        <ShowRolesRoleList
          key="townsfolk"
          type="townsfolk"
          roles={townsfolk}
        />
        <ShowRolesRoleList
          key="outsider"
          type="outsider"
          roles={outsiders}
        />
        <ShowRolesRoleList
          key="minion"
          type="minion"
          roles={minions}
        />
        <ShowRolesRoleList
          key="demon"
          type="demon"
          roles={demons}
        />
        {jinxes && jinxes.length > 0 &&
          <div className="jinxed">
            <div className="role-team jinxed">
              <h4>Jinxed</h4>
            </div>
            <ul>
              {jinxes.map((jinxed) => (
                jinxed.jinxes.map((jinx) => (
                  <li key={jinxed + '_' + jinx}>
                    <span
                      className="role-icon"
                      style={{
                        backgroundImage: 'url(' + getImage(jinxed.id) + ')'
                      }}
                    >
                    </span>
                    <span
                      className="role-icon"
                      style={{
                        backgroundImage: 'url(' + getImage(jinx.id) + ')'
                      }}
                    >
                    </span>
                    <div className="role-desc">
                      <span className="role-name">{ getRole(jinxed.id).name + ' & ' + getRole(jinx.id).name }</span>
                      <span className="role-ability">{ jinx.reason }</span>
                    </div>
                  </li>
                ))
              ))}
            </ul>
          </div>
        }
      </div>
    </>
  );
}

function ShowRolesRoleList({ type, roles }) {
  return (
    <div className={type}>
      <div className={'role-team ' + type}>
        <h4>{ type }</h4>
      </div>
      <ul>
        {roles.map((role) => (
          <li key={role}>
            <span
              className="role-icon"
              style={{
                backgroundImage: 'url(' + getImage(role) + ')'
              }}
            >  
            </span>
            <div className="role-desc">
              <span className="role-name">{ getRole(role).name }</span>
              <span className="role-ability">{ getRole(role).ability }</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShowNightOrder({ edition }) {
  const fabled = useSelector(state => state.others.fabled).map(fabled => getFabled(fabled));

  const town = getTown(edition).map(role => getRole(role));

  const players = useSelector(state => state.players).filter((player) => player.role && player.role !== -1);

  const travellers = getCurrentTravellersWithRole(players.map(player => player.role));

  const fullTown = [...fabled, ...town, ...travellers];

  const firstNightOrder = fullTown.filter((role) => role.firstNight && role.firstNight != 0).map((role) => {
    return {
      ...role,
      players: players.filter((player) => player.role === role.id),
    };
  });

  if (players.length > 6) {
    firstNightOrder.push(
      {
        id: 'evil',
        name: 'Minion info',
        firstNight: 5,
        team: 'minion',
        players: players.filter((player) => getRole(player.role).team === 'minion'),
        firstNightReminder:
          '• If more than one Minion, they all make eye contact with each other. ' +
          '• Show the “This is the Demon” card. Point to the Demon.',
      },
      {
        id: 'evil',
        name: "Demon info & bluffs",
        firstNight: 8,
        team: "demon",
        players: players.filter((player) => getRole(player.role).team === 'demon'),
        firstNightReminder:
          '• Show the “These are your minions” card. Point to each Minion. ' +
          '• Show the “These characters are not in play” card. Show 3 character tokens of good ' +
          'characters not in play.',
      }
    );
  }

  firstNightOrder.sort((a, b) => {
    return a.firstNight - b.firstNight;
  });

  const otherNightOrder = fullTown.filter((role) => role.otherNight && role.otherNight != 0).map((role) => {
    return {
      ...role,
      players: players.filter((player) => player.role === role.id),
    };
  });

  otherNightOrder.sort((a, b) => {
    return a.otherNight - b.otherNight;
  });

  return (
    <>
      <h3>Night Order: {getEdition(edition).name}</h3>
      <div className="menu-content menu-night-order scrollable">
        <NightOrder
          key="first"
          title="First Night:"
          order={firstNightOrder}
          type="first"
        />
        <NightOrder
          key="other"
          title="Other Nights:"
          order={otherNightOrder}
          type="other"
        />
      </div>
    </>
  );
}

function NightOrder({ title, order, type }) {
  return (
    <div className="night-order">
      <h4 className={type}>{ title }</h4>
      <ul className={type}>
        {order.map(role => (
          <li
            key={role.id + role.firstNight}
            className={role.team}
          >
            <span
              className="role-icon"
              style={{
                backgroundImage: 'url(' + getImage(role.id) + ')'
              }}
            >  
            </span>
            <span className="role-name">
              { role.name }
              { role.players.length > 0 && 
                <>
                  <br />
                  <span className="role-players">
                    { role.players.map(player => player.name).join(', ') }
                  </span>
                </>
              }
            </span>
            <span className="role-reminder">
              { role[type + 'NightReminder'] }
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function pickRandom( array, number ) {
  if (number < 1) {
    return [];
  }

  const shuffled = [...array];

  shuffled.sort(() => 0.5 - Math.random());

  return shuffled.slice(0, number);
}

// the fact that id have to write a bunch of back and forth functions makes reusing the html here less irritating even though I'd like to avoid it!
function SetupMenu({ edition }) {
  const playerCount = useSelector(state => state.players.filter(player => !getRole(player.role) || !getRole(player.role).team || getRole(player.role).team !== 'traveler').length);

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

  const town = getTown(edition);
  const townsfolk = getTown(edition, 'townsfolk').map(role => getRole(role));
  const outsiders = getTown(edition, 'outsider').map(role => getRole(role));
  const minions = getTown(edition, 'minion').map(role => getRole(role));
  const demons = getTown(edition, 'demon').map(role => getRole(role));

  const [selectedTownsfolk, setSelectedTownsfolk] = useState(() => {
    return pickRandom(townsfolk, townNumber[playerCount - 5] ? townNumber[playerCount - 5].townsfolk : 0).map(role => role.id);
  });
  const [selectedOutsiders, setSelectedOutsiders] = useState(() => {
    return pickRandom(outsiders, townNumber[playerCount - 5] ? townNumber[playerCount - 5].outsider : 0).map(role => role.id);
  });
  const [selectedMinions, setSelectedMinions] = useState(() => {
    return pickRandom(minions, townNumber[playerCount - 5] ? townNumber[playerCount - 5].minion : 0).map(role => role.id);
  });
  const [selectedDemons, setSelectedDemons] = useState(() => {
    return pickRandom(demons, townNumber[playerCount - 5] ? townNumber[playerCount - 5].demon : 0).map(role => role.id);
  });
  const [sendRolesToPlayers, setSendRolesToPlayers] = useState(true);

  function randomizeSetup() {
    setSelectedTownsfolk(pickRandom(townsfolk, townNumber[playerCount - 5] ? townNumber[playerCount - 5].townsfolk : 0).map(role => role.id));
    setSelectedOutsiders(pickRandom(outsiders, townNumber[playerCount - 5] ? townNumber[playerCount - 5].outsider : 0).map(role => role.id));
    setSelectedMinions(pickRandom(minions, townNumber[playerCount - 5] ? townNumber[playerCount - 5].minion : 0).map(role => role.id));
    setSelectedDemons(pickRandom(demons, townNumber[playerCount - 5] ? townNumber[playerCount - 5].demon : 0).map(role => role.id));
  }

  const selectedRoles = [...selectedTownsfolk, ...selectedOutsiders, ...selectedMinions, ...selectedDemons];

  return (
    <>
      <h3>Setup Roles for {playerCount} players:</h3>
      <div className={'menu-content menu-setup-roles' + (town.length >= 30 ? ' scrollable' : '')}>
        <div className="townsfolk">
          <div className="role-count">
            {selectedTownsfolk.length + '/' + (townNumber[playerCount - 5] ? townNumber[playerCount - 5].townsfolk : 0)}
          </div>
          <div className="role-list">
            {townsfolk.map((role, i) => (
              <div 
                key={i}
                className={'token-container' + (selectedTownsfolk.includes(role.id) ? ' selected' : '')}
                style={{
                  height: getSpecial(role.id, 'selection', 'bag-duplicate') && selectedTownsfolk.includes(role.id) && '12vmin',
                }}
              >
                {role.setup && selectedTownsfolk.includes(role.id) &&
                  <FontAwesomeIcon className="warning" icon={faTriangleExclamation} />
                }
                <Token
                  key={i}
                  click={() => {
                    if (selectedTownsfolk.includes(role.id)) {
                      setSelectedTownsfolk(selectedTownsfolk => selectedTownsfolk.filter(r => r !== role.id));
                    }
                    else
                    {
                      setSelectedTownsfolk(selectedTownsfolk => selectedTownsfolk.concat(role.id));
                    }
                  }}
                  role={role}
                  description={town.length < 30 && 'right'}
                />
                {getSpecial(role.id, 'selection', 'bag-duplicate')  && selectedTownsfolk.includes(role.id) &&
                  <div className="role-duplicate">
                    <span
                      className="role-minus"
                      onClick={() => {
                        setSelectedTownsfolk((selectedTownsfolk) => {
                          const index = selectedTownsfolk.indexOf(role.id);

                          if (index > -1) {
                            const newSelected = [...selectedTownsfolk];

                            newSelected.splice(index, 1);

                            return newSelected;
                          }

                          return selectedTownsfolk;
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </span>
                    <span className="role-amount">{ selectedTownsfolk.filter(r => r === role.id).length }</span>
                    <span 
                      className="role-plus"
                      onClick={() => {
                        setSelectedTownsfolk(selectedTownsfolk => selectedTownsfolk.filter(r => r === role.id).length >= playerCount ? selectedTownsfolk : selectedTownsfolk.concat(role.id));
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </span>
                  </div>
                }
              </div>
            ))}
          </div>
        </div>
        <div className="outsider">
          <div className="role-count">
            {selectedOutsiders.length + '/' + (townNumber[playerCount - 5] ? townNumber[playerCount - 5].outsider : 0)}
          </div>
          <div className="role-list">
            {outsiders.map((role, i) => (
              <div 
                key={i}
                className={'token-container' + (selectedOutsiders.includes(role.id) ? ' selected' : '')}
                style={{
                  height: getSpecial(role.id, 'selection', 'bag-duplicate') && selectedOutsiders.includes(role.id) && '12vmin',
                }}
              >
                {role.setup && selectedOutsiders.includes(role.id) &&
                  <FontAwesomeIcon className="warning" icon={faTriangleExclamation} />
                }
                <Token
                  key={i}
                  click={() => {
                    if (selectedOutsiders.includes(role.id)) {
                      setSelectedOutsiders(selectedOutsiders => selectedOutsiders.filter(r => r !== role.id));
                    }
                    else
                    {
                      setSelectedOutsiders(selectedOutsiders => selectedOutsiders.concat(role.id));
                    }
                  }}
                  role={role}
                  description={town.length < 30 && 'right'}
                />
                {getSpecial(role.id, 'selection', 'bag-duplicate') && selectedOutsiders.includes(role.id) &&
                  <div className="role-duplicate">
                    <span
                      className="role-minus"
                      onClick={() => {
                        setSelectedOutsiders((selectedOutsiders) => {
                          const index = selectedOutsiders.indexOf(role.id);

                          if (index > -1) {
                            const newSelected = [...selectedOutsiders];

                            newSelected.splice(index, 1);

                            return newSelected;
                          }

                          return selectedOutsiders;
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </span>
                    <span className="role-amount">{ selectedOutsiders.filter(r => r === role.id).length }</span>
                    <span 
                      className="role-plus"
                      onClick={() => {
                        setSelectedOutsiders(selectedOutsiders => selectedOutsiders.filter(r => r === role.id).length >= playerCount ? selectedOutsiders : selectedOutsiders.concat(role.id));
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </span>
                  </div>
                }
              </div>
            ))}
          </div>
        </div>
        <div className="minion">
          <div className="role-count">
            {selectedMinions.length + '/' + (townNumber[playerCount - 5] ? townNumber[playerCount - 5].minion : 0)}
          </div>
          <div className="role-list">
            {minions.map((role, i) => (
              <div 
                key={i}
                className={'token-container' + (selectedMinions.includes(role.id) ? ' selected' : '')}
                style={{
                  height: getSpecial(role.id, 'selection', 'bag-duplicate') && selectedMinions.includes(role.id) && '12vmin',
                }}
              >
                {role.setup && selectedMinions.includes(role.id) &&
                  <FontAwesomeIcon className="warning" icon={faTriangleExclamation} />
                }
                <Token
                  key={i}
                  click={() => {
                    if (selectedMinions.includes(role.id)) {
                      setSelectedMinions(selectedMinions => selectedMinions.filter(r => r !== role.id));
                    }
                    else
                    {
                      setSelectedMinions(selectedMinions => selectedMinions.concat(role.id));
                    }
                  }}
                  role={role}
                  description={town.length < 30 && 'right'}
                />
                {getSpecial(role.id, 'selection', 'bag-duplicate') && selectedMinions.includes(role.id) &&
                  <div className="role-duplicate">
                    <span
                      className="role-minus"
                      onClick={() => {
                        setSelectedMinions((selectedMinions) => {
                          const index = selectedMinions.indexOf(role.id);

                          if (index > -1) {
                            const newSelected = [...selectedMinions];

                            newSelected.splice(index, 1);

                            return newSelected;
                          }

                          return selectedMinions;
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </span>
                    <span className="role-amount">{ selectedMinions.filter(r => r === role.id).length }</span>
                    <span 
                      className="role-plus"
                      onClick={() => {
                        setSelectedMinions(selectedMinions => selectedMinions.filter(r => r === role.id).length >= playerCount ? selectedMinions : selectedMinions.concat(role.id));
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </span>
                  </div>
                }
              </div>
            ))}
          </div>
        </div>
        <div className="demon">
          <div className="role-count">
            {selectedDemons.length + '/' + (townNumber[playerCount - 5] ? townNumber[playerCount - 5].demon : 0)}
          </div>
          <div className="role-list">
            {demons.map((role, i) => (
              <div 
                key={i}
                className={'token-container' + (selectedDemons.includes(role.id) ? ' selected' : '')}
                style={{
                  height: getSpecial(role.id, 'selection', 'bag-duplicate') && selectedDemons.includes(role.id) && '12vmin',
                }}
              >
                {role.setup && selectedDemons.includes(role.id) &&
                  <FontAwesomeIcon className="warning" icon={faTriangleExclamation} />
                }
                <Token
                  key={i}
                  click={() => {
                    if (selectedDemons.includes(role.id)) {
                      setSelectedDemons(selectedDemons => selectedDemons.filter(r => r !== role.id));
                    }
                    else
                    {
                      setSelectedDemons(selectedDemons => selectedDemons.concat(role.id));
                    }
                  }}
                  role={role}
                  description={town.length < 30 && 'right'}
                />
                {getSpecial(role.id, 'selection', 'bag-duplicate') && selectedDemons.includes(role.id) &&
                  <div className="role-duplicate">
                    <span
                      className="role-minus"
                      onClick={() => {
                        setSelectedDemons((selectedDemons) => {
                          const index = selectedDemons.indexOf(role.id);

                          if (index > -1) {
                            const newSelected = [...selectedDemons];

                            newSelected.splice(index, 1);

                            return newSelected;
                          }

                          return selectedDemons;
                        });
                      }}
                    >
                      <FontAwesomeIcon icon={faMinus} />
                    </span>
                    <span className="role-amount">{ selectedDemons.filter(r => r === role.id).length }</span>
                    <span 
                      className="role-plus"
                      onClick={() => {
                        setSelectedDemons(selectedDemons => selectedDemons.filter(r => r === role.id).length >= playerCount ? selectedDemons : selectedDemons.concat(role.id));
                      }}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </span>
                  </div>
                }
              </div>
            ))}
          </div>
        </div>
        <div className="setup-checkbox">
          <input
            id="send-roles-to-players"
            type="checkbox"
            checked={sendRolesToPlayers}
            className={sendRolesToPlayers ? 'checked' : ''}
            onChange={() => setSendRolesToPlayers(!sendRolesToPlayers)}
          />
          <label
            htmlFor="send-roles-to-players"
            className={sendRolesToPlayers ? 'checked' : ''}
          >
            Send Roles to players after assignment
          </label>
        </div>
        <div className="button-group">
          <div
            className={'button' + ((playerCount >= 5 && selectedRoles.length === playerCount) ? '' : ' locked') }
            onClick={() => {
              sendJsonMessage({
                type: 'assignRoles',
                myId: me,
                gameId: gameId,
                selectedRoles: selectedRoles,
                sendRolesToPlayers: sendRolesToPlayers,
              });
            }}
          >
            {'Assign ' + selectedRoles.length + ' Roles to Players'}
          </div>
          <div
            className="button"
            onClick={randomizeSetup}
          >
            Random Setup
          </div>
        </div>
        {selectedRoles.some(role => getRole(role).setup) && 
          <div className="setup-warning">
            <FontAwesomeIcon className="warning" icon={faTriangleExclamation} />
            <span>One or more of the selected roles have setup which the randomizer does not account for! Make sure you account for these roles before randomizing!</span>
          </div>
        }
      </div>
    </>
  );
}

function getTime(datenow) {
  const date = new Date(datenow);

  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);

  return hours + ':' + minutes
}

function ShowVotingHistory() {
  const votingHistory = useSelector(state => state.others.votingHistory);

  return (
    <>
      <h3>Voting History</h3>
      <div className="menu-content menu-voting-history scrollable">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Nominator</th>
              <th>Nominee</th>
              <th>Type</th>
              <th>Votes</th>
              <th>Majority</th>
              <th style={{ width: '30%' }}>Voters</th>
            </tr>
          </thead>
          <tbody>
            {votingHistory && votingHistory.length > 0 && votingHistory.map((data) => (
              <tr key={data.time} >
                <td>{getTime(data.time)}</td>
                <td>{data.nominator}</td>
                <td>{data.nominated}</td>
                <td>{data.type}</td>
                <td>{data.votes}</td>
                <td>{data.majority}</td>
                <td>{data.voters ? data.voters.join(', ') : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function EditionMenu() {
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

  return (
    <>
      <h3>Select Edition</h3>
      <div className="menu-content menu-edition-select scrollable">
        {editions.map((edition) => (
          <div
            className="edition-option"
            style={{ backgroundImage: 'url(' + getEditionImage(edition.id) + ')' }}
            key={edition.id}
            onClick={() => {
              dispatch(setEdition(edition.id));

              sendJsonMessage({
                type: 'setEdition',
                myId: me,
                gameId: gameId,
                edition: edition.id,
              });

              dispatch(closeMenu());
            }}
          >
            <span>{ edition.name }</span>
          </div>
        ))}
        <div
          className="edition-option"
          style={{ backgroundImage: 'url(' + getEditionImage('custom') + ')' }}
          key="custom"
          onClick={() => {
            dispatch(setMenu({
              menu: 'uploadCustomEdition',
              target: -1,
            }));
          }}
        >
          <span>Custom Script</span>
        </div>
      </div>
    </>
  );
}

function CustomEdition() {
  const me = useSelector(state => state.me);
  const gameId = useSelector(state => state.game);

  const question = useSelector(state => state.dialogue.question);
  const response = useSelector(state => state.dialogue.response);

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

  function sendScript(script) {
    sendJsonMessage({
      type: 'setEdition',
      myId: me,
      gameId: gameId,
      edition: script,
    });

    dispatch(closeMenu());
  }

  // credit to Steffen/bra1n copypasted this and some code below, under GPL! if it aint broke don't fix it angle ig
  async function handleURL(url) {
    //dumb fix for botc scripts handing out url with http redirect
    const res = await fetch(url.replace('http://botc-scripts.azurewebsites.net/', 'https://botc-scripts.azurewebsites.net/'));

    if (res && res.json) {
      try {
        const script = await res.json();
        sendScript(script);
      } catch (e) {
        sendJsonMessage({
          type: 'storytellerAlert',
          myId: me,
          gameId: gameId,
          alert: 'Could not parse URL as JSON. Please use a valid JSON file.',
          self: true,
        });
      }
    }
  }

  useEffect(() => {
    if (question === 'Enter URL to a custom-script.json file' && response) {
      handleURL(response);
      dispatch(clearQuestion());
    }
  }, [question, response, dispatch, handleURL]);

  const fileInput = useRef(null);

  return (
    <>
      <h3>Load Custom Edition</h3>
      <div className="menu-content menu-custom-edition">
        <input
          type="file"
          onChange={(event) => {
            const file = event.target.files[0];

            const reader = new FileReader();

            reader.addEventListener("load", () => {
              try {
                const script = JSON.parse(reader.result);
                sendScript(script);
              } catch (e) {
                sendJsonMessage({
                  type: 'storytellerAlert',
                  myId: me,
                  gameId: gameId,
                  alert: 'Could not parse file as JSON. Please upload a valid JSON file.',
                  self: true,
                });
              }
            });

            reader.readAsText(file);
          }}
          ref={fileInput}
          style={{display: 'none'}}
        />
        <div className="button-group">
          <div
            className="button"
            onClick={() => {
              fileInput.current.value = '';
              fileInput.current.click();
            }}
          >
            Upload a Script
          </div>
          <div
            className="button"
            onClick={() => {
              dispatch(setQuestion('Enter URL to a custom-script.json file'));
            }}
          >
            Enter URL
          </div>
          <div
            className="button"
            onClick={async () => {
              const text = await navigator.clipboard.readText();
              try {
                const roles = JSON.parse(text);
                sendScript(roles);
              } catch (e) {
                // a self alert is a bit of a waste of network traffic, but we aren't able to communicate with the network handler component so its the most consistent way for now.
                sendJsonMessage({
                  type: 'storytellerAlert',
                  myId: me,
                  gameId: gameId,
                  alert: 'Could not parse clipboard as JSON. Please paste a valid JSON file.',
                  self: true,
                });
              }
            }}
          >
            Use Clipboard JSON
          </div>
          <div
            className="button"
            onClick={() => {
              dispatch(setMenu({
                menu: 'setEdition',
                target: -1,
              }));
            }}
          >
            Back
          </div>
        </div>
      </div>
    </>
  );
}

export default GlobalMenus;
