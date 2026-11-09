
import { createSlice } from "@reduxjs/toolkit";

const activitySlice = createSlice({
  name: "activity",

  initialState: [],

  reducers: {
    setActivityFromDatabase: (state, action) => {
      return Array.isArray(action.payload)
        ? action.payload
        : [];
    },

    logActivity: (state, action) => {
      const exists = state.some(
        (entry) =>
          String(entry.id) === String(action.payload.id)
      );

      if (!exists) {
        state.unshift(action.payload);
      }

      if (state.length > 250) {
        state.length = 250;
      }
    }
  }
});

export const {
  setActivityFromDatabase,
  logActivity
} = activitySlice.actions;

export default activitySlice.reducer;
