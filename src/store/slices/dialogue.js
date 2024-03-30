import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  question: false,
  response: false,
};

export const dialogueSlice = createSlice({
  name: 'dialogue',
  initialState,
  reducers: {
    setQuestion: (state, action) => {
      state.question = action.payload;
    },
    setResponse: (state, action) => {
      state.response = action.payload;
    },
    clearQuestion: () => {
      return initialState;
    },
  },
});

export const { setQuestion, setResponse, clearQuestion } = dialogueSlice.actions;

export default dialogueSlice.reducer;