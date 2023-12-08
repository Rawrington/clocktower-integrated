import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  nominator: {},
  nominated: {},
  hand: -1,
  transition: 1,
  open: false,
  nominating: false,
};

export const nominationSlice = createSlice({
  name: 'nomination',
  initialState,
  reducers: {
    setNomination: (state, action) => {
      return {...state, ...action.payload};
    },
    setHand: (state, action) => {
      state.hand = action.payload;
    },
    turnHand: (state) => {
      state.hand = state.hand + 1;
    },
    setNominationsOpen: (state, action) => {
      state.open = action.payload;
    },
    setTransition: (state, action) => {
      state.transition = action.payload;
    },
    clearNomination: () => {
      return initialState;
    },
  },
});

export const { setNomination, setHand, turnHand, setNominationsOpen, setTransition, clearNomination } = nominationSlice.actions;

export default nominationSlice.reducer;