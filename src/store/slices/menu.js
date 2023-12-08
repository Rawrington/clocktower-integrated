import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  menu: '',
  target: -1,
};

export const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setMenu: (state, action) => {
      if (action.payload.menu == state.menu) {
        return initialState;
      }
      return action.payload;
    },
    closeMenu: () => {
      return initialState;
    },
  },
});

export const { setMenu, closeMenu } = menuSlice.actions;

export default menuSlice.reducer;