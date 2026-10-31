import { createSlice } from "@reduxjs/toolkit";

import { fetchWeather } from "../../actions/weather";

const initialState = {
  status: "idle",
  data: null,
  error: null,
  lastUpdated: null
};

const weatherSlice = createSlice({
  name: "weather",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchWeather.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })

      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })

      .addCase(fetchWeather.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ||
          action.error.message ||
          "Weather unavailable";
      });
  }
});

export default weatherSlice.reducer;