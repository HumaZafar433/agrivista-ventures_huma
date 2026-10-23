import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchWeather = createAsyncThunk("weather/fetchWeather", async () => {
  // Demo city: Lahore, Pakistan. Existing live WeatherCard remains unchanged.
  const url = "https://api.open-meteo.com/v1/forecast?latitude=31.5204&longitude=74.3587&current=temperature_2m,relative_humidity_2m,wind_speed_10m&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=Asia%2FKarachi";
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather request failed (${response.status})`);
  return await response.json();
});

const weatherSlice = createSlice({
  name: "weather",
  initialState: { status: "idle", data: null, error: null, lastUpdated: null },
  reducers: {},
  extraReducers: builder => builder
    .addCase(fetchWeather.pending, state => { state.status = "loading"; state.error = null; })
    .addCase(fetchWeather.fulfilled, (state, action) => { state.status = "succeeded"; state.data = action.payload; state.lastUpdated = new Date().toISOString(); })
    .addCase(fetchWeather.rejected, (state, action) => { state.status = "failed"; state.error = action.error.message || "Weather unavailable"; })
});
export default weatherSlice.reducer;
