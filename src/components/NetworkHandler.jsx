import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import useSound from 'use-sound';

import SOCKET_URL from '../socket_config.js'

import { setPlayerList, updatePlayer, setMarked, clearMarked, clearHands, clearPlayerList } from '../store/slices/players';
import { setEdition } from '../store/slices/edition';
import { setGameId } from '../store/slices/game';
import { closeMenu } from '../store/slices/menu';
import { setNomination, setTransition, setHand } from '../store/slices/nomination';
import { setNight } from '../store/slices/night';
import { setTimer } from '../store/slices/timer';
import { setFabled, setVotingHistory, setAlert, setVoiceMembers, clearStorytellerGrim, setStorytellerGrim, showStorytellerGrim, setDayNumber, setGameEndText, setActiveSpecials } from '../store/slices/others';
import { clearNotes } from '../store/slices/notes';

import { getEdition, clearCache } from '../genericFunctions';

import countdown from '../assets/sounds/countdown.mp3';
import alert from '../assets/sounds/alert.mp3';
import timerEndSound from '../assets/sounds/timer.mp3';

const whitelist = [
  'syncGameState',
  'updatePlayerList',
  'updatePlayer',
  'setNight',
  'setEdition',
  'setNomination',
  'setTimer',
  'setFabled',
  'setHand',
  'nominationOver',
  'clearMarked',
  'closeMenu',
  'setVotingHistory',
  'playCountdown',
  'storytellerAlert',
  'updateVoice',
  'setVoiceMembers',
  'storytellerGrim',
  'timerEnd',
  'setGameEnd',
  'setActiveSpecials',
];

const events = ['mousedown', 'touchstart'];

function NetworkHandler() {
  const [ hasInteracted, setHasInteracted ] = useState(false);
  const [ lastRMessage, setLastRMessage ] = useState(0);

  const alertRef = useRef(null);
  const countdownRef = useRef(null);
  const gameEndRef = useRef(null);

  const { sendJsonMessage, lastMessage, lastJsonMessage, readyState } = useWebSocket(
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

  const dispatch = useDispatch();

  useEffect(() => {
    if (readyState !== ReadyState.OPEN || !lastJsonMessage || !lastJsonMessage.type || (lastRMessage && lastJsonMessage === lastRMessage)) {
      return;
    }

    if(!lastJsonMessage.type) {
      return;
    }

    setLastRMessage(lastJsonMessage);

    if (lastJsonMessage.type === 'syncGameState') {
      if (lastJsonMessage.firstConnect) {
        dispatch(clearPlayerList());
        dispatch(clearNotes());
      }

      dispatch(setPlayerList(lastJsonMessage.players));
      dispatch(setEdition(lastJsonMessage.edition));
      dispatch(setNomination(lastJsonMessage.nomination));
      dispatch(setNight(lastJsonMessage.night));
      dispatch(setTimer(lastJsonMessage.timer));
      dispatch(setFabled(lastJsonMessage.fabled));
      dispatch(setGameId(lastJsonMessage.gameId));
      dispatch(setVotingHistory(lastJsonMessage.votingHistory));
      dispatch(setDayNumber(lastJsonMessage.dayNumber));
      dispatch(setActiveSpecials(lastJsonMessage.activeSpecials));

      if (typeof lastJsonMessage.edition === 'object') {
        getEdition(lastJsonMessage.edition);
      }
    }

    if (lastJsonMessage.type === 'updatePlayerList') {
      dispatch(setPlayerList(lastJsonMessage.players));
    }

    if (lastJsonMessage.type === 'updatePlayer') {
      dispatch(updatePlayer(lastJsonMessage.player));
    }

    if (lastJsonMessage.type === 'setNight') {
      dispatch(setNight(lastJsonMessage.night));

      if (lastJsonMessage.night) {
        dispatch(setNomination({
          nominating: false,
        }));
      }

      dispatch(setDayNumber(lastJsonMessage.dayNumber));
    }

    if (lastJsonMessage.type === 'setEdition') {
      dispatch(setFabled([]));
      dispatch(setEdition(lastJsonMessage.edition));

      if (typeof lastJsonMessage.edition === 'object') {
        clearCache();
        getEdition(lastJsonMessage.edition);
      }
    }

    if (lastJsonMessage.type === 'setNomination') {
      dispatch(setNomination({
        ...lastJsonMessage.nomination,
        nominating: false,
      }));
    }

    if (lastJsonMessage.type === 'setTimer') {
      dispatch(setTimer(lastJsonMessage.timer));
    }

    if (lastJsonMessage.type === 'setFabled') {
      dispatch(setFabled(lastJsonMessage.fabled));
    }

    if (lastJsonMessage.type === 'setHand') {
      dispatch(setTransition(lastJsonMessage.transition));
      dispatch(setHand(lastJsonMessage.hand));
    }

    if (lastJsonMessage.type === 'setVotingHistory') {
      dispatch(setVotingHistory(lastJsonMessage.votingHistory));
    }

    if (lastJsonMessage.type === 'nominationOver') {
      dispatch(setNomination({
        nominator: {},
        nominated: {},
        hand: -1,
        over: false,
        running: false,
        nominating: false,
        countdown: false,
      }));

      dispatch(clearHands());

      if (lastJsonMessage.mark) {
        dispatch(setMarked(lastJsonMessage.mark));
      }
    }

    if (lastJsonMessage.type === 'clearMarked') {
      dispatch(clearMarked());
    }

    if (lastJsonMessage.type === 'closeMenu') {
      dispatch(closeMenu());
    }

    if (lastJsonMessage.type === 'storytellerAlert') {
      dispatch(setAlert(''));

      setTimeout(() => {
        dispatch(setAlert(lastJsonMessage.alert));
      });

      if (alertRef.current) {
        clearTimeout(alertRef.current);
      }

      alertRef.current = setTimeout(() => {
        dispatch(setAlert(''));
      }, 5000);
    }

    if (lastJsonMessage.type === 'updateVoice') {
      dispatch(setVoiceMembers(lastJsonMessage.members));
    }

    if (lastJsonMessage.type === 'storytellerGrim') {
      if(!lastJsonMessage.players || !lastJsonMessage.notes) {
        dispatch(clearStorytellerGrim());
      }
      else {
        dispatch(setStorytellerGrim(lastJsonMessage));
        dispatch(showStorytellerGrim(false));
      }
    }

    if (lastJsonMessage.type === 'timerEnd') {
      dispatch(setAlert(''));

      setTimeout(() => {
        dispatch(setAlert('The Timer has finished counting down!'));
      });

      if (alertRef.current) {
        clearTimeout(alertRef.current);
      }

      alertRef.current = setTimeout(() => {
        dispatch(setAlert(''));
      }, 5000);
    }

    if (lastJsonMessage.type === 'setGameEnd') {
      dispatch(setGameEndText(lastJsonMessage.result));

      if (gameEndRef.current) {
        clearTimeout(gameEndRef.current);
      }

      gameEndRef.current = setTimeout(() => {
        dispatch(setGameEndText(false));
      }, 8000);
    }

    if (lastJsonMessage.type === 'playCountdown') {
      dispatch(setNomination({
        countdown: false,
      }));

      setTimeout(() => {
        dispatch(setNomination({
          countdown: true,
        }));
      });
    }

    if (lastJsonMessage.type === 'setActiveSpecials') {
      dispatch(setActiveSpecials(lastJsonMessage.activeSpecials));
    }
  });

  function listener() {
    if (hasInteracted === false) {
      setHasInteracted(true);
    }
  };

  useEffect(() => {
    events.forEach((event) => {
      document.addEventListener(event, listener);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, listener);
      });   
    };
  }, []);

  if (hasInteracted && lastJsonMessage) {
    return (<AudioHandler 
      messageType={lastJsonMessage.type}
      canPlay={!lastRMessage || lastJsonMessage !== lastRMessage}
    />);
  }

  return (<></>);
}

function AudioHandler({ messageType, canPlay }) {
  const [ playCountdown, countdownSound ] = useSound(countdown);
  const [ playAlert ] = useSound(alert);
  const [ playTimer ] = useSound(timerEndSound);

  useEffect(() => {
    if (canPlay && messageType === 'playCountdown') {
      playCountdown();
    }

    if (canPlay && messageType === 'nominationOver') {
      countdownSound.stop();
    }

    if (canPlay && messageType === 'storytellerAlert') {
      playAlert();
    }

    if (canPlay && messageType === 'timerEnd') {
      playTimer();
    }

  });

  return null;
}

export default NetworkHandler;
