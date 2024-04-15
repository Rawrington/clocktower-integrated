import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import '../css/Dialogue.css';

import { clearQuestion, setResponse } from '../store/slices/dialogue';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

function Dialogue() {
  const {question, response, defaulted} = useSelector(state => state.dialogue);

  const [inputAnswer, setInputAnswer] = useState('');
  const [firstOpened, setFirstOpened] = useState(true);

  const dispatch = useDispatch();

  if (!question || response) {
    return null;
  }



  function updateAnswer(event) {
    setFirstOpened(false);

    if(event.target.value.length > 512) {
      setInputAnswer(inputAnswer);
      return
    }
    
    setInputAnswer(event.target.value);
  }

  return (
    <>
      <div className="global-menu-modal question-modal">
        <div
          className="global-menu-x"
          onClick={() => {
            dispatch(clearQuestion());
            setInputAnswer('');
            setFirstOpened(true);
          }}
        >
          <FontAwesomeIcon icon={faX} />
        </div>
        <h3>{ question }</h3>
        <div className="menu-content question-prompt">
          <input
            type="text"
            name="answerr"
            value={(firstOpened && defaulted) ? defaulted : inputAnswer}
            onChange={updateAnswer}
            maxLength="512"
            autoComplete="off"
          />
          <div className="button-group">
            <div
              className={'button' + (inputAnswer.length > 0 ? '' : ' locked') }
              onClick={() => {
                if(inputAnswer.length > 0) {
                  dispatch(setResponse(inputAnswer));
                }
                setInputAnswer('');
                setFirstOpened(true);
              }}
            >
              Ok
            </div>
            <div
              className="button"
              onClick={() => {
                dispatch(clearQuestion());
                setInputAnswer('');
                setFirstOpened(true);
              }}
            >
              Cancel
            </div>
          </div>
        </div>
      </div>
      <div className="question-backdrop" />
    </>
  );
}

export default Dialogue;

