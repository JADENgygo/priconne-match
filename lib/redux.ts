import { createSlice } from "@reduxjs/toolkit";
import { combineReducers, configureStore } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  last: null,
};

const slice = createSlice({
  name: "clans",
  initialState,
  reducers: {
    setClans: (state, action) => {
      return {list: action.payload.list, last: action.payload.last};
    },
  },
});

export const { setClans } = slice.actions;

const reducer = combineReducers({
  clans: slice.reducer,
});

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ["payload.last"],
        ignoredPaths: ["clans.last"],
      },
    });
  },
});
