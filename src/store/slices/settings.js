import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  timerMinutes: 5,
  timerSeconds: 0,
  pauseTimerDuringNom: true,
  extendTimerAfterNom: 2,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action) => {
      return action.payload;
    },
    updateSettings: (state, action) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    clearSettings: () => {
      return initialState;
    },
  },
});

export const { setSettings, updateSettings, clearSettings } = settingsSlice.actions;

export default settingsSlice.reducer;