import { createAsyncThunk } from "@reduxjs/toolkit";

import { getWeather } from "../../api/weather";

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",

  async (_, { rejectWithValue }) => {
    try {
      const data = await getWeather();

      return data;
    } catch (error) {
      const message = error.response?.status
        ? `Weather request failed (${error.response.status})`
        : "Unable to load live weather.";

      return rejectWithValue(message);
    }
  }
);