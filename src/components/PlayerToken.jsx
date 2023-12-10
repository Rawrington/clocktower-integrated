import { useEffect, useState, useRef, forwardRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import useResizeObserver from '@react-hook/resize-observer';

import SOCKET_URL from '../socket_config.js';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical, faCheckToSlot, faHand, faX, faHandPointUp, faSkull, faHippo, faOtter, faHorseHead, faFrog, faDragon, faCrow } from '@fortawesome/free-solid-svg-icons';

import { updatePlayer } from '../store/slices/players';
import { setMenu } from '../store/slices/menu';
import { setNomination } from '../store/slices/nomination';

import { getBox, getRole } from '../genericFunctions';

import Token from './token';

import noteBackground from '../assets/reminder.png';
import plusImage from '../assets/plus.png';
import shroud from '../assets/shroud.png';

import '../css/PlayerToken.css';

import standardRoles from '../roles.json';

const resizeEvents = [
  'updatePlayerList',
]

// write this here because its a mess and i want to easily update it as needed
function selectPlayerById(state, id, storyteller) {
  const players = storyteller ? state.others.st.players : state.players;

  return players.map(player => {
    return {
      id: player.id,
      name: player.name,
      role: player.role,
      usedGhostVote: player.usedGhostVote,
      dead: player.dead,
      handUp: player.handUp,
      voteLocked: player.voteLocked,
      marked: player.marked,
    };
  }).find((player) => player.id === id);
}

// if you are reading this i am so sorry, SO SO SORRY, I spilled my spaghetti all over the inline styles
const PlayerToken = forwardRef(({ order, id, sizing, storyteller }, ref) => {
  const player = useSelector(state => selectPlayerById(state, id, storyteller), shallowEqual);
  const privilegeLevel = useSelector(state => state.privilege);
  const nomination = useSelector(state => state.nomination);
  const me = useSelector(state => state.me);
  const gameId = useSelector(state => state.game);

  function handleResize(node) {
    const { x, y, width, height } = node.getBoundingClientRect();

    dispatch(updatePlayer({
      id: player.id,
      x: x,
      y: y,
      width: width,
      height: height,
    }));
  }

  const { sendJsonMessage } = useWebSocket(
    SOCKET_URL,
    {
      filter: (message) => {
        if (message.data === 'pong') {
          return false;
        }

        let json = {};
        try {
          json = JSON.parse(message.data);
        }
        catch {
          return false;
        }

        if (typeof json !== 'object')
          return false;

        if (resizeEvents.includes(json.type)) {
          if (playerRef && playerRef.current && playerRef.current.getBoundingClientRect) {
            handleResize(playerRef.current);
          }
        }

        return false; //we do not care about ANY incoming messages we need to send them!
      },
      share: true,
    }
  );

  const dispatch = useDispatch();

  const [menuOpen, setMenuOpen] = useState(false);

  const playerRef = useRef(null);

  const role = getRole(player.role) || undefined;

  const rotation = (0 + (360 / sizing) * (order));

  const bottom = (order / sizing) > 0.26 && (order / sizing) < 0.74;

  const zswap = ((order / sizing) > 0.26 && (order / sizing) < 0.49) || (order / sizing) > 0.74;

  const zIndex = zswap ? order + 2 : 2 + sizing - order;

  const style = {
    transform: 'rotate(' + rotation + 'deg) translateY(-38vmin)',
    width: '14vmin',
    height: '14vmin',
    zIndex: zIndex,
  };

  useResizeObserver(ref, (entry) => {
    if (playerRef && playerRef.current && playerRef.current.getBoundingClientRect) {
      handleResize(playerRef.current);
    }
  });

  useResizeObserver(playerRef, (entry) => {
    handleResize(entry.target);
  });
  // this works because we wont be scrolling, theres probably a better way to do it? idk

  return (
    <>
      <li style={style}>
        <div
          className="player"
          style={{ 
            transform: 'rotate(' + -rotation + 'deg)',
          }}
        >
          <div
            className={
              bottom ? 'label bottom-label' : 'label top-label'
            }
            onClick={() => {
              setMenuOpen(!menuOpen);
            }}
            style = {{
              pointerEvents: (nomination.nominating || privilegeLevel == 0) && 'none',
            }}
          >
            <span>{ player.name }</span>
            <FontAwesomeIcon icon={faEllipsisVertical} style={{
              color: '#ffffff',
              position: 'absolute',
              right: 10,
            }} />
            {menuOpen && privilegeLevel == 1 &&
              <div className="player-menu">
                <ul>
                  {nomination.open &&
                    <li
                      onClick={() => {
                        setMenuOpen(menuOpen => !menuOpen);

                        dispatch(setNomination({
                          nominating: player.id,
                        }));
                      }}
                    >Nominate</li>
                  }
                  <li
                    onClick={() => {
                      setMenuOpen(menuOpen => !menuOpen);

                      sendJsonMessage({
                        type: 'removePlayer',
                        myId: me,
                        gameId: gameId,
                        player: player.id,
                      });
                    }}
                  >Remove Player</li>
                </ul>
              </div>
            }
          </div>
          <div 
            className="token-container"
            ref={playerRef}
            onClick={() => {
              if (nomination.nominating && nomination.open) {
                sendJsonMessage({
                  type: 'nominate',
                  myId: me,
                  gameId: gameId,
                  nominated: player.id,
                  nominator: nomination.nominating,
                });

                dispatch(setNomination({
                  nominating: false,
                }));
              }
            }}
          >
            {(privilegeLevel == 1 || player.dead) &&
              <div
                className="dead"
                style={{
                  backgroundImage: 'url(' + shroud + ')',
                  zIndex: zIndex+1,
                  opacity: player.dead && 1,
                  transform: player.dead && 'scale(1)',
                  cursor: privilegeLevel == 1 && 'pointer',
                  pointerEvents: privilegeLevel == 0 && 'none',
                }}
                onClick={() => {
                  if(privilegeLevel == 1) {
                    dispatch(updatePlayer({
                      id: player.id,
                      dead: !player.dead,
                      marked: false,
                      usedGhostVote: false,
                    }));

                    sendJsonMessage({
                      type: 'updatePlayer',
                      myId: me,
                      gameId: gameId,
                      player: {
                        id: player.id,
                        dead: !player.dead,
                        usedGhostVote: false,
                        marked: false,
                      },
                    });
                  }
                }}
              ></div>
            }
            <Token
              key={player.name}
              click={() => {
                dispatch(setMenu({
                  menu: 'setToken',
                  target: player.id,
                }));
              }}
              role={role}
              description={(order >= 0 && order < ((sizing / 2))) ? 'left' : 'right'}
            />
            {player.dead && !player.usedGhostVote &&
              <div 
                className="ghost-vote"
                style={{
                  bottom: bottom && 0,
                  top: !bottom && 0,
                  zIndex: zIndex+2,
                  cursor: privilegeLevel == 1 && 'pointer',
                }}
                onClick={() => {
                  if (privilegeLevel === 1) {
                    dispatch(updatePlayer({
                      id: player.id,
                      usedGhostVote: true,
                    }))

                    sendJsonMessage({
                      type: 'updatePlayer',
                      myId: me,
                      gameId: gameId,
                      player: {
                        id: player.id,
                        usedGhostVote: true,
                      },
                    });
                  }
                }}
              >
                <FontAwesomeIcon icon={faCheckToSlot} />
              </div>
            }
            {player.id === me &&
              <PlayerIndicator
                bottom={bottom}
                zIndex={zIndex} 
              />
            }
            <div
              className="svg-overlay"
              style={{ 
                zIndex: zIndex+2,
                pointerEvents: (!nomination.nominating || !nomination.open) && 'none',
              }}
            >
              <FontAwesomeIcon
                style={{
                  color: '#ffffff',
                  opacity: player.marked && 0.8,
                }}
                className="player-marked"
                icon={faSkull}
                viewBox="0 0 448 512"
              />
              {!isNaN(nomination.nominated.index) && 
                <>
                  <FontAwesomeIcon
                    className={player.handUp ? 'hand-up' : ''}
                    style={{
                      opacity: player.handUp && player.voteLocked && 1,
                      color: '#ce0100',
                    }}
                    icon={faHand}
                    viewBox="0 0 448 512"
                  />
                  <FontAwesomeIcon
                    style={{
                      opacity: !player.handUp && player.voteLocked && 1,
                      color: '#1f65ff',
                    }}
                    icon={faX}
                    viewBox="0 0 352 512"
                  />
                </>
              }
              <FontAwesomeIcon
                style={{
                  color: '#000000',
                  transform: 'rotate(' + rotation + 'deg)',
                  opacity: nomination.nominating && nomination.open && 1,
                  pointerEvents: nomination.nominating && nomination.open && 'auto',
                }}
                className="player-nominate"
                icon={faHandPointUp}
                viewBox="0 0 352 512"
              />
            </div>
          </div>
          <div 
            className="player-note-add"
            style={{
              transform: 'translateX(-50%) translateY(-50%) rotate(' + rotation + 'deg)',
            }}
          >
            <div className="note-transform">
              <div
                onClick={() => {
                  if (!storyteller) {
                    dispatch(setMenu({
                      menu: 'addNote',
                      target: player.id,
                    }));
                  }
                }}
                style={{
                  transform: 'translateY(12vmin) rotate(' + -rotation + 'deg)',
                  backgroundImage: 'url(' + noteBackground + ')',
                }}
              >
                <div className="note-reminder" style={{ backgroundImage: 'url(' + plusImage + ')' }}></div>
              </div>
            </div>
          </div>
        </div>
      </li>
    </>
  );
});

const icons = [faHippo, faOtter, faHorseHead, faFrog, faDragon, faCrow];

function PlayerIndicator({bottom, zIndex}) {
  const [currentIcon, setCurrentIcon] = useState(faHippo);

  return (
    <div 
      className="my-seat"
      style={{
        bottom: bottom && 0,
        top: !bottom && 0,
        zIndex: zIndex+2,
      }}
      onClick={() => {
        setCurrentIcon(icons[Math.floor( Math.random() * icons.length )]);
      }}
    >
      <FontAwesomeIcon icon={currentIcon} />
    </div>
  );
}

export default PlayerToken;