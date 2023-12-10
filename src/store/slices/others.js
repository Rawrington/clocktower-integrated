import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fabled: [],
  bluffs: ['','',''],
  votingHistory: [],
  alert: '',
  voicemembers: [],
  stshow: false,
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

      console.log(state.st);
    },
    clearStorytellerGrim: (state) => {
      delete state.st;
    },
    showStorytellerGrim: (state, action) => {
      state.stshow = action.payload;
    },
  },
});

export const { setBluffs, setBluff, clearBluffs, setFabled, addFabled, removeFabled, clearFabled, setVotingHistory, setAlert, setVoiceMembers, setStorytellerGrim, clearStorytellerGrim, showStorytellerGrim } = othersSlice.actions;

export default othersSlice.reducer;