import { createSlice } from '@reduxjs/toolkit';

// current player id
const initialState = -1;

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGameId: (state, action) => {
      return action.payload;
    },
  },
});

export const { setGameId } = gameSlice.actions;

export default gameSlice.reducer;