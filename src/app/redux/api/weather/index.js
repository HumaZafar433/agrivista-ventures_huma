import axios from "axios";

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=31.5204&longitude=74.3587" +
  "&current=temperature_2m,relative_humidity_2m,wind_speed_10m" +
  "&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min" +
  "&forecast_days=5" +
  "&timezone=Asia%2FKarachi";

export const getWeather = async () => {
  const response = await axios.get(WEATHER_URL, {
    timeout: 15000
  });

  return response.data;
};