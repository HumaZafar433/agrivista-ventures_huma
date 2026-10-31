import { createSlice } from "@reduxjs/toolkit";

function loadActivity() {
  try {
    const value = JSON.parse(localStorage.getItem("agri_activity") || "[]");
    return Array.isArray(value) ? value.slice(0, 250) : [];
  } catch (error) {
    return [];
  }
}

const activitySlice = createSlice({
  name: "activity",
  initialState: loadActivity(),
  reducers: {
    logActivity(state, action) {
      state.unshift(action.payload);
      if (state.length > 250) state.length = 250;
    }
  }
});
export const { logActivity } = activitySlice.actions;
export default activitySlice.reducer;
