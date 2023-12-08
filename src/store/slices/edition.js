import { createSlice } from '@reduxjs/toolkit';

const initialState = 'tb';

export const editionSlice = createSlice({
  name: 'edition',
  initialState,
  reducers: {
    setEdition: (state, action) => {
      return action.payload;
    },
  },
});

export const { setEdition } = editionSlice.actions;

export default editionSlice.reducer;