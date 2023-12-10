import { useRef, useEffect, useState, useCallback, forwardRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import useWebSocket from 'react-use-websocket';
import SOCKET_URL from '../socket_config.js';

import { updateNotePos, updateNotePlayer, deleteNote } from '../store/slices/notes';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';

import noteBackground from '../assets/reminder.png';

import '../css/DraggableNote.css';

import standardRoles from '../roles.json';

import { getImage } from '../genericFunctions';

import LeaderLine from 'leader-line'

// praise your local divine authority for publicly available resources!
import Draggable from 'react-draggable';

function getNoteById(state, id, storyteller) {
  if (storyteller) {
    return state.others.st.notes.find((note) => note.id === id);
  }
  else
  {
    return state.notes.find((note) => note.id === id);
  }
}

const resizeEvents = [
  'updatePlayerList',
]

const DraggableNote = forwardRef(({ id, storyteller }, ref) => {
  const { reminder, text, position } = useSelector(state => getNoteById(state, id, storyteller));
  const playerListPos = useSelector(state => state.players);
  const [resizing, setResizing] = useState(false);
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
    x: ref.current && ref.current.getBoundingClientRect && ((ref.current.getBoundingClientRect().x + ref.current.getBoundingClientRect().width) / 2),
    y: ref.current && ref.current.getBoundingClientRect && ((ref.current.getBoundingClientRect().y + ref.current.getBoundingClientRect().height) / 2),
  });

  const [endPos, setEndPos] = useState({
    playerIndex: -1,
    x: 0,
    y: 0,
    width: 1,
    heigth: 1,
  });

  const [playerIndex, setPlayerIndex] = useState()

  const reminderImage = getImage(reminder);

  // future proofing!
  const noteRef = useRef(null);

  const lineRef = useRef(null);

  const dispatch = useDispatch();

  const vmin = (dimensions.width < dimensions.height) ? (dimensions.width / 100) : (dimensions.height / 100);

  function findClosestPlayer(curX, curY, storyteller) {
    if (playerListPos.length === 0) {
      return;
    }

    const useX = storyteller ? dimensions.x + (curX - 3.25) * vmin : curX;
    const useY = storyteller ? dimensions.y + (curY - 3.25) * vmin : curY;

    let closestDistance = -1;
    let playerIndex = -1;

    playerListPos.forEach((player, i) => {
      const distSqr = ((player.x - useX) * (player.x - useX)) + ((player.y - useY) * (player.y - useY));

      if (closestDistance == -1 || distSqr < closestDistance) {
        playerIndex = i;
        closestDistance = distSqr;
      }
    });

    if (
      (playerIndex !== endPos.playerIndex 
        || playerListPos[playerIndex].x !== endPos.x
        || playerListPos[playerIndex].y !== endPos.y
        || playerListPos[playerIndex].width !== endPos.width
        || playerListPos[playerIndex].height !== endPos.height)
      || playerIndex !== -1) {
      setEndPos({
        playerIndex: playerIndex,
        x: playerListPos[playerIndex].x,
        y: playerListPos[playerIndex].y,
        width: playerListPos[playerIndex].width,
        height: playerListPos[playerIndex].height,        
      });
    }
  }

  useWebSocket(
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
          if (noteRef && noteRef.current) {
            findClosestPlayer(position.x, position.y);
          }
        }

        return false; //we do not care about ANY incoming messages we need to send them!
      },
      share: true,
    }
  );

  function onDrag(e, data) {
    if (storyteller) {
      return;
    }

    if (noteRef && noteRef.current && lineRef && lineRef.current && lineRef.current.start && ( data.deltaX !== 0 || data.deltaY !== 0 )) {
      lineRef.current.start = LeaderLine.areaAnchor(noteRef.current, {x: 0, y: 0, width: '100%', height: '100%', shape: 'circle'});
    }

    findClosestPlayer(data.x, data.y);
  }

  function onDrop(e, data) {
    if (storyteller) {
      return;
    }

    dispatch(updateNotePos({
      id: id,
      x: data.x,
      y: data.y,
    }));

    findClosestPlayer(data.x, data.y);
  }

  // this might actually be cheating and i would have to map and list through each player list pos to list dependancies for this hook! however, it works for now.
  useEffect(() => {
    findClosestPlayer(position.x, position.y);
  }, [position.x, position.y, playerListPos.length > 0 && playerListPos[0].x, dimensions])

  // this is actually diabolically evil code like this is forcing a bunch of rerenders but i cannot find another solution to leave them unaffected by zoomies
  useEffect(() => {
    function handleResize() {
      if(!ref || !ref.current) {
        return;
      }

      const { x, y, width, height } = ref.current.getBoundingClientRect();

      const curCenterX = x + width / 2;
      const curCenterY = y + height / 2;

      if (!storyteller) {

        const vminApprox = (window.innerWidth < window.innerHeight) ? (window.innerWidth / 100) : (window.innerHeight / 100);

        const oldVminApprox = (dimensions.width < dimensions.height) ? (dimensions.width / 100) : (dimensions.height / 100);

        dispatch(updateNotePos({
          id: id,
          x: curCenterX + ((((position.x + 3.25 * oldVminApprox) - dimensions.x) / oldVminApprox) * vminApprox) - 3.25 * vminApprox,
          y: curCenterY + ((((position.y + 3.25 * oldVminApprox) - dimensions.y) / oldVminApprox) * vminApprox) - 3.25 * vminApprox,
        }));
      }
      
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
        x: curCenterX,
        y: curCenterY,
      });

      setResizing(true);
    }

    if(!dimensions.x || !dimensions.y ) {
      const { x, y, width, height } = ref.current.getBoundingClientRect();

      const centerX = x + width / 2;
      const centerY = y + height / 2;

      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
        x: centerX,
        y: centerY,
      });
    }

    if (resizing) {
      setResizing(false);
    }

    window.addEventListener('resize', handleResize);

    return(() => {
      window.removeEventListener('resize', handleResize);
    });
  }, [ref, ref.current, resizing, dimensions.x, dimensions.y, dimensions.width, dimensions.height, position.x, position.y, storyteller]);

  useEffect(() => {
    if(noteRef.current && !lineRef.current) {
      lineRef.current = new LeaderLine(LeaderLine.areaAnchor(noteRef.current, {x: 0, y: 0, width: '100%', height: '100%', shape: 'circle'}), LeaderLine.areaAnchor({x: 0, y: 0, width: 1, height: 1, shape: 'circle'}), {hide: true});
    }
  }, [noteRef, noteRef.current, lineRef, lineRef.current]);

  useEffect(() => {
    if(lineRef && lineRef.current && lineRef.current.end) {
      lineRef.current.end = LeaderLine.areaAnchor({x: endPos.x, y: endPos.y, width: endPos.width, height: endPos.height, shape: 'circle'});
    }
  }, [endPos]);

  useEffect(() => {
    return (() => {
      if(lineRef.current && lineRef.current.remove) {
        lineRef.current.remove();
        lineRef.current = null;
      }
    });
  }, [])

  // double check xd

  const forcedPosition = (resizing || storyteller) ? (
    storyteller && dimensions.x ? {
      x: dimensions.x + (position.x - 3.25) * vmin,
      y: dimensions.y + (position.y - 3.25) * vmin,
    } : position
  ) : null;

  //if (storyteller && lineRef.current && lineRef.current.show) {
  //  findClosestPlayer(position.x, position.y, storyteller);
  //}

  return (
    <>
      <Draggable
        nodeRef={noteRef}
        defaultPosition={position}
        position={forcedPosition}
        bounds="parent"
        onStop={onDrop}
        onDrag={onDrag}
        onStart={onDrag}
        disabled={storyteller}
      >
        <div
          ref={noteRef}
          className="note"
          style={{ backgroundImage: 'url(' + noteBackground + ')'}}
          onMouseEnter={() => {
            if (lineRef && lineRef.current && lineRef.current.show) {
              findClosestPlayer(position.x, position.y, storyteller);
              lineRef.current.show('fade', {duration: 100, timing: 'linear'});
            }
          }}
          onMouseLeave={() => {
            if (lineRef && lineRef.current && lineRef.current.hide) {
              lineRef.current.hide();
            }
          }}
        >
          {reminder ? (
            <div
              className="note-reminder"
              style={{ backgroundImage: 'url(' + reminderImage + ')' }}
            >
              <div className="note-text">
                <span>{text}</span>
              </div>
            </div>
          ) : (
            <span className="custom-text">{text}</span>
          )}
          {!storyteller &&
            <div
              className="note-hover-x"
              onClick={() => {
                dispatch(deleteNote(id));
              }}
            >
              <FontAwesomeIcon icon={faCircleXmark} />
            </div>
          }
        </div>
      </Draggable>
    </>
  );
});

export default DraggableNote;