import { combineReducers, configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'reduxjs-toolkit-persist';
import storage from 'reduxjs-toolkit-persist/lib/storage';

import dialogueReducer from './slices/dialogue';
import editionReducer from './slices/edition';
import gameReducer from './slices/game';
import meReducer from './slices/me';
import menuReducer from './slices/menu';
import nominationReducer from './slices/nomination';
import notesReducer from './slices/notes';
import nightReducer from './slices/night';
import othersReducer from './slices/others';
import playersReducer from './slices/players';
import privilegeReducer from './slices/privilege';
import settingsReducer from './slices/settings';
import timerReducer from './slices/timer';

import { setPlayers } from './slices/players';

const persistConfig = {
  key: 'root',
  storage: storage,
  blacklist: ['dialogue', 'edition', 'me', 'menu', 'nomination', 'privilege', 'settings', 'timer'] //get rekt losers
};

const reducers = combineReducers({
  edition: editionReducer,
  game: gameReducer,
  me: meReducer,
  menu: menuReducer,
  nomination: nominationReducer,
  notes: notesReducer,
  night: nightReducer,
  others: othersReducer,
  players: playersReducer,
  privilege: privilegeReducer,
  settings: settingsReducer,
  timer: timerReducer,
});

const _persistedReducer = persistReducer(persistConfig, reducers)

export const store = configureStore({
  reducer: _persistedReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      /* ignore persistance actions */
      ignoredActions: [
        FLUSH,
        REHYDRATE,
        PAUSE,
        PERSIST,
        PURGE,
        REGISTER,
      ],
    },
  }),
})