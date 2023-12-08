import { createSlice } from '@reduxjs/toolkit';

// 0 = player, 1 = storyteller
const initialState = 1;

export const privilegeSlice = createSlice({
  name: 'privilege',
  initialState,
  reducers: {
    setPrivilege: (state, action) => {
      return action.payload;
    },
  },
});

export const { setPrivilege } = privilegeSlice.actions;

export default privilegeSlice.reducer;