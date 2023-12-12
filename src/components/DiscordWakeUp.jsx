import { useState, useRef, useEffect, forwardRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import useWebSocket from 'react-use-websocket';
import SOCKET_URL from '../socket_config.js';

import '../css/DiscordWakeUp.css';

import { getRole, getSpecial } from '../genericFunctions';

import { NoteOption } from './GlobalMenus';

import Draggable from 'react-draggable';

const DiscordWakeUp = forwardRef((props, ref) => {
  const privilegeLevel = useSelector(state => state.privilege);

  const players = useSelector(state => state.players);
  const notes = useSelector(state => state.notes);
  const voicemembers = useSelector(state => state.others.voicemembers);
  const isNight = useSelector(state => state.night);

  const me = useSelector(state => state.me);
  const gameId = useSelector(state => state.game);

  const dragRef = useRef(null);

  const { sendJsonMessage } = useWebSocket(
    SOCKET_URL,
    {
      filter: (message) => {
        return false; //we do not care about ANY incoming messages we need to send them!
      },
      share: true,
    }
  );

  if(!isNight || players.length < 5 || !voicemembers || voicemembers.length <= 0 || privilegeLevel <= 0) {
    return null;
  }

  const curPlayers = voicemembers.reduce((playerArray, member) => {
    const player = players.find(p => p.id === member);

    if (player) {
      return playerArray.concat(player);
    }

    return playerArray;
  }, []);

  if (curPlayers.length <= 0) {
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

  return (
    <Draggable
      positionOffset={{x: '-50%', y: '-50%'}}
      nodeRef={dragRef}
      bounds={{
        left: -(window.innerWidth / 2), 
        top: -(window.innerHeight / 2), 
        right: window.innerWidth / 2, 
        bottom: window.innerHeight / 2,
      }}
      cancel=".discord-players > div"
    >
      <div
        className="discord-wake-up"
        ref={dragRef}
      >
        <h3>You are in currently in voice with:</h3>
        <div className="discord-players">
          {curPlayers.map(player => (
            <div key={player.id}>
              <span>{player.name + (getRole(player.role) ? (' the ' + getRole(player.role).name) : '')}</span>
              {player.firstNight && 
                <span>It is {player.name}'s first night as their role.</span>
              }
              <span>Reminder tokens on {player.name}:</span>
              <div className="reminder-container">
                {mappedNotes.filter(note => note.player === player.id).map(note => (
                  <NoteOption
                    key={note.id}
                    note={note.text}
                    reminder={note.reminder}
                  />
                ))}
              </div>
              {getSpecial(player.role, 'signal', 'grimoire') && getSpecial(player.role, 'signal', 'grimoire').time === 'night' &&
                <div 
                  className="button"
                  onClick={() => {
                    if (!ref || !ref.current) {
                      return;
                    }

                    if (player.hasGrim) {
                      sendJsonMessage({
                        type: 'showGrim',
                        myId: me,
                        gameId: gameId,
                        player: player.id,
                        show: false,
                      });
                      return;
                    }
 
                    const { x, y, width, height } = ref.current.getBoundingClientRect();

                    const centerX = x + width / 2;
                    const centerY = y + height / 2;

                    const stNotes = notes.map((note) => {
                      const vminApprox = (window.innerWidth < window.innerHeight) ? (window.innerWidth / 100) : (window.innerHeight / 100);

                      return {
                        ...note,
                        position: {
                          x: ((note.position.x + 3.25 * vminApprox) - centerX) / vminApprox,
                          y: ((note.position.y + 3.25 * vminApprox) - centerY) / vminApprox,
                        },
                      }
                    });

                    sendJsonMessage({
                      type: 'showGrim',
                      myId: me,
                      gameId: gameId,
                      notes: stNotes,
                      player: player.id,
                      show: true,
                    });
                  }}
                >
                  {player.hasGrim ? 'Stop Sending Grimoire' : 'Send Grimoire'}
                </div>
              }
            </div>
          ))}
        </div>
      </div>
    </Draggable>
  );
});

export default DiscordWakeUp;

