import { createSlice } from '@reduxjs/toolkit';

const initialState = -1;

export const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    setTimer: (state, action) => {
      return action.payload;
    },
  },
});

export const { setTimer } = timerSlice.actions;

export default timerSlice.reducer;