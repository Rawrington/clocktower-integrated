import { createSlice } from '@reduxjs/toolkit';

// current player id
const initialState = -1;

export const meSlice = createSlice({
  name: 'me',
  initialState,
  reducers: {
    setPlayerId: (state, action) => {
      return action.payload;
    },
  },
});

export const { setPlayerId } = meSlice.actions;

export default meSlice.reducer;