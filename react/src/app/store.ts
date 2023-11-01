
// file: store.ts
import { configureStore } from '@reduxjs/toolkit'
import _ from 'lodash'
// We'll use redux-logger just as an example of adding another middleware
import logger from 'redux-logger'

// And use redux-batched-subscribe as an example of adding enhancers
import { batchedSubscribe } from 'redux-batched-subscribe'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AudioplayerState {
  currentTime: number
  value: boolean
  currentTimeInterval: number
  duration: number
  startClip: number
}

interface MingusdataState {
  noteData: [],
}

const initialState = {
    currentTime: 0,
    value: true,
    currentTimeInterval: 0,
    duration: 0,
    startClip: 0,
    noteData: [],
};

export const audioplayerSlice = createSlice({
  name: 'audioplayer',
  initialState,
  reducers: {
    setCurrentTime: (state, action: PayloadAction<number>) => {

      // if (action.payload.length) {
        state.currentTime = action.payload.currentTime;
      // }
    },
    setValue: (state, action: PayloadAction<boolean>) => {
      state.value = action.payload.value;
    },
    setCurrentTimeInterval: (state, action: PayloadAction<number>) => {
      state.currentTimeInterval = action.payload.currentTimeInterval;
    },
    setDuration: (state, action: PayloadAction<number>) => {
      state.duration = action.payload.duration;
    },
    setStartClip: (state, action: PayloadAction<number>) => {
      state.startClip = action.payload.startClip;
    },
  },
});

export const audioplayerReducer = audioplayerSlice.reducer;
// import mingusdataReducer from './mingusdata/mingusdataReducer'







export const mingusdataSlice = createSlice({
  name: 'mingusdata',
  initialState,
  reducers: {
    setNoteData: (state, action: PayloadAction<number>) => {
     console.log('??? actionm p ', action.payload);
      // state.noteData.concat(action.payload);
    },
  },
});

export const mingusdataReducer = mingusdataSlice.reducer;



const reducer = {
  audioplayer: audioplayerReducer,
  mingusdata: mingusdataReducer,
}

const preloadedState = {
  audioplayer: {
      currentTime: 0,
      value: true,
      currentTimeInterval: 0,
      duration: 0,
      startClip: 0,
  },
  mingusdata: {
      noteData: [],
  },
    isLoading: false,
    error: null,
}

const debounceNotify = _.debounce((notify) => notify())

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: process.env.NODE_ENV !== 'production',
  preloadedState,
  enhancers: [batchedSubscribe(debounceNotify)],
})

// The store has been created with these options:
// - The slice reducers were automatically passed to combineReducers()
// - redux-thunk and redux-logger were added as middleware
// - The Redux DevTools Extension is disabled for production
// - The middleware, batched subscribe, and devtools enhancers were composed together
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch