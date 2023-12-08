import { createSlice } from '@reduxjs/toolkit';

// currently night
const initialState = false;

export const nightSlice = createSlice({
  name: 'night',
  initialState,
  reducers: {
    setNight: (state, action) => {
      return action.payload;
    },
  },
});

export const { setNight } = nightSlice.actions;

export default nightSlice.reducer;