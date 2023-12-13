import { createSlice } from '@reduxjs/toolkit';

const initialState = [];

export const playersSlice = createSlice({
  name: 'players',
  initialState,
  reducers: {
    setPlayers: (state, action) => {
      return action.payload;
    },
    updatePlayer: (state, action) => {
      const i = state.findIndex(player => player.id == action.payload.id);

      if (i !== -1) {
        state[i] = {
          ...state[i],
          ...action.payload,
        };
      }
    },
    clearHands: (state) => {
      state.forEach(player => {
        player.handUp = false;
        player.voteLocked = false;
      });
    },
    setPlayerList: (state, action) => {
      return action.payload.map((player) => {
        const oldPlayer = state.find(oldPlayer => oldPlayer.id === player.id);

        if(oldPlayer) {
          return {
            ...oldPlayer,
            ...player,
          }
        }

        return player;
      });
    },
    clearPlayerList: (state) => {
      return initialState;
    },
    setMarked: (state, action) => {
      return state.map(player => {
        return {
          ...player,
          handUp: false,
          voteLocked: false,
          marked: player.id === action.payload ? true : false,
        };
      });
    },
    clearMarked: (state) => {
      return state.map(player => {
        return {
          ...player,
          marked: false,
        };
      });
    }
  },
});

export const { setPlayers, updatePlayer, clearHands, setPlayerList, clearPlayerList, setMarked, clearMarked } = playersSlice.actions;

export function selectPlayerList(state) {
  return state.players.map(player => player.id);
}

export function selectAliveCounter(state) {
  return state.players.filter(player => !player.dead).length;
}

export function selectVoteCount(state) {
  return state.players.filter(player => !player.dead || !player.usedGhostVote).length;
}

export default playersSlice.reducer;