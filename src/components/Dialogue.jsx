import { useState } from 'react';
import { useSelector } from 'react-redux';

import '../css/Dialogue.css';

import { clearQuestion, setResponse } from '../store/slices/dialogue';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';

function Dialogue() {
  const question = useSelector(state => state.dialogue.question);

  if (!question) {
    return null;
  }

  return (
    <div
      className="question-backdrop"
      onClick={() => {
        dispatch(clearQuestion());
      }}
    >
      <div className="question-modal">
        <div
          className="question-x"
          onClick={() => {
            dispatch(closeMenu());
          }}
        >
          <FontAwesomeIcon icon={faX} />
        </div>
        <div className="question-prompt">
          
        </div>
      </div>
    </div>
  );
}

export default Dialogue;

