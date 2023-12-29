import { useState, useRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import SOCKET_URL from '../socket_config.js';

import { setPlayerId } from '../store/slices/me';
import { setPrivilege } from '../store/slices/privilege';

const whitelist = [
  'authenticate',
]

// I honestly forgor that Maps were a thing its probably not a problem I hope!
function AppNetworkGate({ children }) {
  const [ sentAuth, setSentAuth ] = useState(true);
  const [ lostConnection, setLostConnection ] = useState(false);
  const [ canRetry, setCanRetry ] = useState(false);
  const lastMessageTime = useRef(-1);
  const timerRef = useRef(null);

  const { sendJsonMessage, lastMessage, lastJsonMessage, readyState } = useWebSocket(
    SOCKET_URL,
    {
      filter: (message) => {
        lastMessageTime.current = Date.now();

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
      onOpen: (event) => {
        setCanRetry(false);

        if(timerRef.current) {
          clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
          if (Date.now() - lastMessageTime.current > 90000) {
            if(event.target && event.target.close) {
              setCanRetry(true);
              event.target.close();
            }
          }
        }, 90000);

        setSentAuth(false);
      },
      onClose: (event) => {
        setLostConnection(true);

        if(timerRef.current) {
          clearInterval(timerRef.current);
        }
      },
      retryOnError: true,
      shouldReconnect: (closeEvent) => {
        return canRetry;
      },
      reconnectAttempts: 20,
      reconnectInterval: 3000,
      share: true,
    }
  );

  if(ReadyState.OPEN && !sentAuth) {
    const queryParameters = new URLSearchParams(window.location.search);

    const token = queryParameters.get("token");

    sendJsonMessage({
      type: 'authenticate',
      token: token,
      now: Date.now(),
    })

    setSentAuth(true);
  }

  const dispatch = useDispatch();

  if (!lostConnection && ReadyState.OPEN && lastJsonMessage && lastJsonMessage.type === 'authenticate') {
    dispatch(setPrivilege(lastJsonMessage.privilege));
    dispatch(setPlayerId(lastJsonMessage.id));

    return (
      <>
        {children}
      </>
    );
  }

  return (
    <div className="network-status">
      {lostConnection ? 'Disconnected from Game.' : 'Attempting to Connect to Game.'}
    </div>
  );
}

export default AppNetworkGate;
