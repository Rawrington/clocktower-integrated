import { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserGroup, faUsers, faHeartPulse, faCheckToSlot, faClock } from '@fortawesome/free-solid-svg-icons';

import '../css/DiscordWakeUp.css';

import { getRole, getSpecial } from '../genericFunctions';

import { NoteOption } from './GlobalMenus';


function DiscordWakeUp() {
  const players = useSelector(state => state.players);
  const notes = useSelector(state => state.notes);
  const voicemembers = useSelector(state => state.others.voicemembers);
  const isNight = useSelector(state => state.night);

  if(!isNight || players.length < 5 || !voicemembers || voicemembers.length <= 0) {
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
    <div className="discord-wake-up">
      <h3>You are in currently in voice with:</h3>
      <div className="discord-players">
        {curPlayers.map(player => (
          <div key={player.id}>
            <span>{player.name + (getRole(player.role) ? (' the ' + getRole(player.role).name) : '')}</span>
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
                  console.log('send grim');
                }}
              >
                {player.hasGrim ? 'Stop Sending Grimoire' : 'Send Grimoire'}
              </div>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

export default DiscordWakeUp;

