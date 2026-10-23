import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchWeather } from "../store/reducers/weatherReducer";

function WeatherCard() {

  const dispatch = useDispatch();

  const {
    data: weather,
    status,
    error,
    lastUpdated
  } = useSelector((state) => state.weather);

  useEffect(() => {

    dispatch(fetchWeather());

    const interval = setInterval(() => {
      dispatch(fetchWeather());
    }, 600000);

    return () => {
      clearInterval(interval);
    };

  }, [dispatch]);


  if (!weather && (status === "loading" || status === "idle")) {
    return (
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-body p-4">
          <p className="text-muted mb-0">
            Loading live weather...
          </p>
        </div>
      </div>
    );
  }


  if (!weather && status === "failed") {
    return (
      <div className="alert alert-danger">
        {error || "Unable to load weather."}

        <button
          className="btn btn-sm btn-outline-danger ms-3"
          onClick={() => dispatch(fetchWeather())}
        >
          Retry
        </button>
      </div>
    );
  }


  if (!weather) {
    return null;
  }


  const current = weather.current;
  const daily = weather.daily;

  if (!current || !daily) {
    return (
      <div className="alert alert-warning">
        Weather information is incomplete.
      </div>
    );
  }


  const humidityStatus =
    current.relative_humidity_2m < 40
      ? "Low"
      : current.relative_humidity_2m > 70
      ? "High"
      : "Optimal";


  const forecastDays = (daily.time || []).slice(1, 4);


  return (
    <div className="card border-0 shadow-sm rounded-4">

      <div className="card-body p-4">

        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">

          <h5 className="fw-bold mb-0">
            Live Weather - Lahore
          </h5>

          <button
            className="btn btn-sm btn-outline-success"
            onClick={() => dispatch(fetchWeather())}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Updating..." : "Refresh"}
          </button>

        </div>


        {error && (
          <div className="alert alert-warning mt-3 mb-0">
            {error}
          </div>
        )}


        <div className="row g-3 mt-2">

          <div className="col-md-3">
            <p className="text-muted mb-1">
              Temperature
            </p>

            <h3>
              {current.temperature_2m}°C
            </h3>
          </div>


          <div className="col-md-3">
            <p className="text-muted mb-1">
              Air Humidity
            </p>

            <h3>
              {current.relative_humidity_2m}%
            </h3>

            <span className="badge text-bg-success">
              {humidityStatus}
            </span>
          </div>


          <div className="col-md-3">
            <p className="text-muted mb-1">
              Wind Speed
            </p>

            <h3>
              {current.wind_speed_10m} km/h
            </h3>
          </div>


          <div className="col-md-3">
            <p className="text-muted mb-1">
              Rain Chance Today
            </p>

            <h3>
              {daily.precipitation_probability_max?.[0] ?? "N/A"}%
            </h3>
          </div>

        </div>


        <hr />


        <h6 className="fw-bold">
          Next 3 Days Forecast
        </h6>


        <div className="row g-3 mt-1">

          {forecastDays.map((day, index) => (

            <div className="col-md-4" key={day}>

              <div className="bg-light rounded-3 p-3">

                <strong>
                  {day}
                </strong>

                <p className="mb-1 mt-2">
                  Max: {daily.temperature_2m_max?.[index + 1] ?? "N/A"}°C
                </p>

                <p className="mb-0">
                  Min: {daily.temperature_2m_min?.[index + 1] ?? "N/A"}°C
                </p>

              </div>

            </div>

          ))}

        </div>


        <p className="text-muted small mt-3 mb-0">

          Last updated:{" "}

          {lastUpdated
            ? new Date(lastUpdated).toLocaleTimeString()
            : "Not available"}

        </p>

      </div>

    </div>
  );
}

export default WeatherCard;