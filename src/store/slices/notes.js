import { createSlice } from '@reduxjs/toolkit'

const initialState = []

export const notesSlice = createSlice({
  name: 'notes',
  initialState,
  reducers: {
    addNote: (state, action) => {
      state.push(action.payload);
    },
    updateNotePos: (state, action) => {
      const i = state.findIndex(note => note.id == action.payload.id);

      if (i != -1) {
        state[i] = {
          ...state[i],
          position: { x: action.payload.x, y: action.payload.y },
        };
      }
    },
    updateNotePlayer: (state, action) => {
      const i = state.findIndex(note => note.id == action.payload.id);

      if (i != -1) {
        state[i] = {
          ...state[i],
          player: action.payload.player,
        };
      }
    },
    deleteNote: (state, action) => {
      const i = state.findIndex(note => note.id == action.payload);

      if (i != -1) {
        state.splice(i, 1);
      }
    },
    clearNotes: () => {
      return initialState;
    },
  },
});

// i, fucking, love, immer

export const { addNote, updateNotePos, updateNotePlayer, deleteNote, clearNotes } = notesSlice.actions;

export function selectNotesList(state) {
  return state.notes.map(note => note.id);
}

export default notesSlice.reducer;