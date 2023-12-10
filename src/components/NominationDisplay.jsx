import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import SOCKET_URL from '../socket_config.js';

import '../css/NominationDisplay.css';

import { updatePlayer, selectAliveCounter } from '../store/slices/players';

import smallHand from '../assets/clock-small.png';
import bigHand from '../assets/clock-big.png';

const whitelist = [
  'requestFinalVote',
];

function getMyHand(state, me) {
  const player = state.players.find(player => player.id === me);

  return player && player.handUp;
}

function canDoVote(state, me) {
  const player = state.players.find(player => player.id === me);

  return (player && !player.voteLocked && (!player.dead || !player.usedGhostVote));
}

const getRotation = (index, sizing) => (0 + (360 / sizing) * (index));

function NominationDisplay() {
  const nomination = useSelector(state => state.nomination);
  const privilegeLevel = useSelector(state => state.privilege);
  const gameSize = useSelector(state => state.players.length);
  const alivePlayers = useSelector(selectAliveCounter);
  const me = useSelector(state => state.me);
  const myHand = useSelector(state => getMyHand(state, me));
  const canVote = useSelector(state => canDoVote(state, me));
  const currentVotes = useSelector(state => state.players.filter(player => player.handUp).length);
  const gameId = useSelector(state => state.game);

  const { lastJsonMessage, readyState, sendJsonMessage } = useWebSocket(
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

        return whitelist.includes(json.type);
      },
      share: true,
    }
  );

  if(readyState === ReadyState.OPEN && lastJsonMessage && lastJsonMessage.type && lastJsonMessage.type === 'requestFinalVote') {
    sendJsonMessage({
      type: 'finalVote',
      myId: me,
      gameId: gameId,
      hand: myHand,
    });
  }

  const dispatch = useDispatch();

  if (isNaN(nomination.nominated.index)) {
    return <></>;
  }

  const smallHandStyle = {
    transform: 'rotate(' + getRotation(nomination.nominator.index, gameSize) + 'deg)',
    backgroundImage: 'url(' + smallHand + ')',
  };

  const bigHandStyle = {
    transform: 'rotate(' + getRotation(nomination.hand, gameSize) + 'deg)',
    backgroundImage: 'url(' + bigHand + ')',
    transitionDuration: nomination.transition + 's',
  };

  const blue = {
    color: '#1f65ff',
  };

  const red = {
    color: '#ce0100',
  };

  return (
    <>
      <div className="nomination-display">
        <div
          className="clock-hand"
          style={bigHandStyle}
        />
        <div
          className="clock-hand"
          style={smallHandStyle}
        />
        <div className="nomination-text">
          <span style={blue}>{nomination.nominator.name}</span> nominated <span style={red}>{nomination.nominated.name}</span><br />
          <span style={blue}>{currentVotes} votes</span> in favor <span style={red}>(majority {Math.ceil(alivePlayers / 2)})</span>
          <div className="button-group">
            {privilegeLevel == 1 ? (
              <>
                {!nomination.running && !nomination.over && 
                  <>
                    <div
                      className="button"
                      onClick={() => {
                        sendJsonMessage({
                          type: 'startVote',
                          myId: me,
                          gameId: gameId,
                          transition: nomination.transition,
                          countdown: true,
                        });
                      }}
                    >
                      Countdown
                    </div>
                    <div
                      className="button"
                      onClick={() => {
                        sendJsonMessage({
                          type: 'startVote',
                          myId: me,
                          gameId: gameId,
                          transition: nomination.transition,
                          countdown: false,
                        });
                      }}
                    >
                      Instant
                    </div>
                  </>
                }
                {nomination.over ? (
                  <>
                    <div
                      className="button"
                      onClick={() => {
                        sendJsonMessage({
                          type: 'endVote',
                          result: true,
                          mark: true,
                          myId: me,
                          gameId: gameId,
                        });
                      }}
                    >
                      Mark for Execution
                    </div>
                    <div
                      className="button"
                      onClick={() => {
                        sendJsonMessage({
                          type: 'endVote',
                          result: true,
                          myId: me,
                          gameId: gameId,
                        });
                      }}
                    >
                      Close
                    </div>
                  </>
                ) : (
                  <div
                    className="button"
                    onClick={() => {
                      sendJsonMessage({
                        type: 'endVote',
                        result: false,
                        myId: me,
                        gameId: gameId,
                      });
                    }}
                  >
                    Cancel
                  </div>
                )}
              </>
            ) : (
              <div
                className={canVote ? 'button' : 'button locked'}
                onClick={() => {
                  if(canVote) {
                    dispatch(updatePlayer({
                      id: me,
                      handUp: !myHand, 
                    }));
                    sendJsonMessage({
                      type: 'updateHand',
                      myId: me,
                      gameId: gameId,
                      hand: !myHand,
                    });
                  }
                }}
              >
                { myHand ? 'Hand Down' : 'Hand Up' }
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default NominationDisplay;

