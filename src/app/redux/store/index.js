import { configureStore } from "@reduxjs/toolkit";

import rootReducer from "../reducers";

import persistMiddleware from "../../../store/middleware/persistMiddleware";

import activityLogger from "../../../store/middleware/activityLogger";

const store = configureStore({
  reducer: rootReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      activityLogger,
      persistMiddleware
    ),

  devTools: true
});

export default store;