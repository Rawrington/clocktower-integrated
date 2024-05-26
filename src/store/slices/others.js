import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fabled: [],
  bluffs: ['','',''],
  votingHistory: [],
  alert: '',
  voicemembers: [],
  stshow: false,
  daynumber: 0,
  gameEndText: false,
  activeSpecials: [],
};

export const othersSlice = createSlice({
  name: 'others',
  initialState,
  reducers: {
    setBluffs: (state, action) => {
      state.bluffs = action.payload;
    },
    setBluff: (state, action) => {
      state.bluffs[action.payload.id] = action.payload.bluff;
    },
    clearBluffs: (state) => {
      state.bluffs = initialState.bluffs;
    },
    setFabled: (state, action) => {
      state.fabled = action.payload;
    },
    addFabled: (state, action) => {
      state.fabled.push(action.payload);
    },
    removeFabled: (state, action) => {
      state.fabled = state.fabled.filter(fabled => fabled !== action.payload);
    },
    clearFabled: (state) => {
      state.fabled = initialState.fabled;
    },
    setVotingHistory: (state, action) => {
      state.votingHistory = action.payload;
    },
    setAlert: (state, action) => {
      state.alert = action.payload;
    },
    setVoiceMembers: (state, action) => {
      state.voicemembers = action.payload;
    },
    setStorytellerGrim: (state, action) => {
      state.st = {};
      state.st.players = action.payload.players;
      state.st.notes = action.payload.notes;
    },
    clearStorytellerGrim: (state) => {
      delete state.st;
    },
    showStorytellerGrim: (state, action) => {
      state.stshow = action.payload;
    },
    setDayNumber: (state, action) => {
      state.daynumber = action.payload;
    },
    incrementDay: (state) => {
      state.daynumber = state.daynumber + 1;
    },
    setGameEndText: (state, action) => {
      state.gameEndText = action.payload;
    },
    setActiveSpecials: (state, action) => {
      state.activeSpecials = action.payload;
    },
  },
});

export const { setBluffs, setBluff, clearBluffs, setFabled, addFabled, removeFabled, clearFabled, setVotingHistory, setAlert, setVoiceMembers, setStorytellerGrim, clearStorytellerGrim, showStorytellerGrim, setDayNumber, incrementDay, setGameEndText, setActiveSpecials } = othersSlice.actions;

export default othersSlice.reducer;