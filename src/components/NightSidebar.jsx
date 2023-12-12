import { useState, useRef, useEffect, forwardRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import useWebSocket from 'react-use-websocket';
import SOCKET_URL from '../socket_config.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVolumeHigh } from '@fortawesome/free-solid-svg-icons';

import '../css/NightSidebar.css';

import { getRole, getImage } from '../genericFunctions';

import { NoteOption } from './GlobalMenus';

import Draggable from 'react-draggable';

function NightSidebar() {
  const [ sidebarOpen, setSidebarOpen ] = useState(false);

  const privilegeLevel = useSelector(state => state.privilege);

  const players = useSelector(state => state.players);
  const notes = useSelector(state => state.notes);
  const voicemembers = useSelector(state => state.others.voicemembers);
  const isNight = useSelector(state => state.night);
  const dayNumber = useSelector(state => state.others.daynumber);

  const me = useSelector(state => state.me);
  const gameId = useSelector(state => state.game);

  const { sendJsonMessage } = useWebSocket(
    SOCKET_URL,
    {
      filter: (message) => {
        return false; //we do not care about ANY incoming messages we need to send them!
      },
      share: true,
    }
  );

  if(!isNight || players.length < 5 || privilegeLevel <= 0) {
    return null;
  }

  const mappedNotes = notes.map((note) => {
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

  const playerOrder = players.map((player) => {
    return {
      id: player.id,
      name: player.name,
      role: getRole(player.role),
      firstNight: player.firstNight,
    };
  }).filter((player) => dayNumber <= 1 ? (
    player.role && player.role.firstNight && player.role.firstNight != 0
  ) : (
    (player.role && player.role.otherNight && player.role.otherNight != 0) || (player.role && player.firstNight)
  )).map(player => {
    const playerNotes = mappedNotes.filter(note => note.player === player.id);

    // global notes first!
    playerNotes.sort((a, b) => (a.globalIndex >= 0 ? a.globalIndex : 999) - (b.globalIndex >= 0 ? b.globalIndex : 999));

    return {
      ...player,
      notes: playerNotes,
    }
  });

  if(playerOrder.length <= 0) {
    return null;
  }

  if (dayNumber <= 1 && players.length > 6) {
    // add in minion info/demon bluffs
    playerOrder.push({
      id: 'minion-info',
      role: {
        firstNight: 5,
      },
    });
    playerOrder.push({
      id: 'demon-bluffs',
      role: {
        firstNight: 6,
      },
    });
  }

  if (dayNumber > 1 && playerOrder.some(player => !player.role.otherNight && player.firstNight === true)) {
    // add in handy seperator
    playerOrder.push({
      id: 'new-role',
      role: {
        otherNight: 998,
      },
    });
  }

  // if a player has become a first night role put them last in the menu 
  playerOrder.sort((a, b) => dayNumber <= 1 ? (a.role.firstNight - b.role.firstNight) : ((a.role.otherNight || 999) - (b.role.otherNight || 999)));



  return (
    <div className={sidebarOpen ? 'night-sidebar night-open' : 'night-sidebar'}>
      <div
        className="night-open-me"
        onClick={() => {
          setSidebarOpen(!sidebarOpen);
        }}
      >
        <h3>Night Helper</h3>
      </div>
      <div className="night-sidebar-content">
      <ul>
        <li>{dayNumber <= 1 ? 'First Night' : 'Other Night'}</li>
        {playerOrder.map((player) => (
          <li
            key={player.id}
            className={player.role.id ? 'player-info' : player.id}
          >
            {player.id === 'minion-info' &&
              'Minion info: ' + players.filter(player => getRole(player.role) && getRole(player.role).team === 'minion').map(player => player.name).join(', ') 
            }
            {player.id === 'demon-bluffs' &&
              'Demon info & bluffs: ' + players.filter(player => getRole(player.role) && getRole(player.role).team === 'demon').map(player => player.name).join(', ') 
            }
            {player.id === 'new-role' &&
              'New Roles (MAY NEED FIRST NIGHT INFO)'
            }
            {player.id !== 'demon-bluffs' && player.id !== 'new-role' && player.id !== 'minion-info' &&
              <>
                <div
                  className={voicemembers.includes(player.id) ? 'button locked' : 'button'}
                  onClick={() => {
                    if (!voicemembers.includes(player.id)) {
                      sendJsonMessage({
                        type: 'goToPlayer',
                        myId: me,
                        gameId: gameId,
                        player: player.id,
                      });
                    }
                  }}
                >
                  {voicemembers.includes(player.id) ? (
                    <FontAwesomeIcon icon={faVolumeHigh} />
                  ) : 'Wake'}
                </div>
                <span
                  className="role-icon"
                  style={player.role ? {
                    backgroundImage: 'url(' + getImage(player.role.id) + ')'
                  } : {}}
                >
                </span>
                <span className="player-name">
                    {player.name}
                </span>
                <div className="reminder-container">
                  {player.notes.map(note => (
                    <NoteOption
                      key={note.id}
                      note={note.text}
                        reminder={note.reminder}
                    />
                  ))}
                </div>
              </>
             } 
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}

export default NightSidebar;

