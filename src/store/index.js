import { configureStore } from "@reduxjs/toolkit";

import rootReducer from "./rootReducer";
import persistMiddleware from "./middleware/persistMiddleware";
import activityLogger from "./middleware/activityLogger";

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