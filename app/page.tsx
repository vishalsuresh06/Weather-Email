"use client";

import React from "react";
import styles from "./page.module.css";

// Interfaces to define types for location and weather data
interface Location {
  lat: number;
  long: number;
}

interface Weather {
  apparent_temperature: number | null;
  dewpoint_2m: number | null;
  interval: number | null;
  precipitation: number | null;
  precipitation_probability: number | null;
  rain: number | null;
  relative_humidity_2m: number | null;
  showers: number | null;
  snow_depth: number | null;
  snowfall: number | null;
  temperature_2m: number | null;
  time: string | null;
}

function isoToRegular(isoString: string): string {
  const date = new Date(isoString);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 to 12 for 12 AM

  return `${month}/${day}/${year}, ${hours
    .toString()
    .padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
}

export default function Home() {
  // States to manage user inputs and API responses
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [location, setLocation] = React.useState<Location | null>(null);
  const [weather, setWeather] = React.useState<Weather | null>(null);
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [smsSent, setSmsSent] = React.useState(false);
  const [options, setOptions] = React.useState([
    true, // Temperature (2 m)
    false, // Relative Humidity
    false, // Dewpoint (2 m)
    false, // Apparent Temperature
    false, // Precipitation Probability
    false, // Precipitation
    false, // Rain
    false, // Showers
    false, // Snowfall
    false, // Snow Depth
  ]);
  const [settings, setSettings] = React.useState(false);

  const CAGEAPI_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;

  // Toggle display of settings menu
  const toggleSettings = () => setSettings(!settings);

  // Toggle individual weather options
  const toggleOption = (index: number) => {
    const updatedOptions = [...options];
    updatedOptions[index] = !updatedOptions[index];
    setOptions(updatedOptions);
  };

  // Fetch geolocation based on city, state, and country
  const fetchGeolocation = async (): Promise<Location | null> => {
    try {
      if (!city || !country) {
        alert("Please enter both city and country.");
        return null;
      }

      // Construct the API URL
      let url = `https://api.opencagedata.com/geocode/v1/json?q=${city}`;
      if (state) url += `,+${state}`;
      url += `,+${country}&key=${CAGEAPI_KEY}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch geolocation data.");

      const data = await res.json();
      if (data.results?.length) {
        const { lat, lng } = data.results[0].geometry;
        return { lat, long: lng };
      } else {
        alert("No geolocation data found for the entered location.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching geolocation:", error);
      alert("An error occurred while fetching geolocation data.");
      return null;
    }
  };

  // Fetch weather data based on coordinates
  const fetchWeather = async (coords: Location): Promise<Weather | null> => {
    try {
      // Construct fields parameter based on selected options
      const fields = [
        options[0] && "temperature_2m",
        options[1] && "relative_humidity_2m",
        options[2] && "dewpoint_2m",
        options[3] && "apparent_temperature",
        options[4] && "precipitation_probability",
        options[5] && "precipitation",
        options[6] && "rain",
        options[7] && "showers",
        options[8] && "snowfall",
        options[9] && "snow_depth",
      ]
        .filter(Boolean)
        .join(",");

      const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.long}&current=${fields}&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto`;
      const res = await fetch(weatherURL);
      if (!res.ok) throw new Error("Failed to fetch weather data.");

      const data = await res.json();
      return data.current ?? null;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      alert("An error occurred while fetching weather data.");
      return null;
    }
  };

  // Main handler for form submission
  const handleSubmit = async () => {
    try {
      const coords = await fetchGeolocation();
      if (!coords) return;

      setLocation(coords);
      const weatherData = await fetchWeather(coords);
      if (weatherData) {
        setWeather(weatherData);
        setWeather({
          ...weatherData,
          time: weatherData.time ? isoToRegular(weatherData.time) : null,
        });
        console.log(weatherData.time);
      }
    } catch (error) {
      console.error("Error handling submit:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div>
      <title>Weather Tool</title>
      <main className={styles.main}>
        {/* Background video */}
        <video autoPlay muted loop className={styles.video}>
          <source src="weather.mp4" type="video/mp4" />
        </video>

        {/* Title */}
        <h1 className={styles.title}>Weather Tool</h1>

        {/* Settings button */}
        <button className={styles.settingsButton} onClick={toggleSettings}>
          <img
            src="settings.png"
            alt="Settings"
            className={styles.settingsIcon}
          />
        </button>

        <div className={styles.body}>
          {/* Input fields for location */}
          <div className={styles.inputAndSettingsContainer}>
            <input
              type="text"
              placeholder="Enter city name"
              className={styles.inputField}
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <input
              type="text"
              placeholder="Enter state name (if applicable)"
              className={styles.inputField}
              value={state}
              onChange={(e) => setState(e.target.value)}
            />

            <input
              type="text"
              placeholder="Enter country name"
              className={styles.inputField}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          {/* Submit button */}
          <button className={styles.submitButton} onClick={handleSubmit}>
            Search
          </button>

          {/* Weather Data Display */}
          <div className={styles.weatherContainer}>
            <h1 className={styles.weatherLabel}>Weather Data</h1>

            {weather ? (
              <div className={styles.weatherData}>
                {options[0] && (
                  <p className={styles.weatherDetail}>
                    <strong>Temperature (2m): </strong>
                    {weather.temperature_2m !== null
                      ? `${weather.temperature_2m} °F`
                      : "N/A"}
                  </p>
                )}
                {options[1] && (
                  <p className={styles.weatherDetail}>
                    <strong>Relative Humidity: </strong>
                    {weather.relative_humidity_2m !== null
                      ? `${weather.relative_humidity_2m} %`
                      : "N/A"}
                  </p>
                )}
                {options[2] && (
                  <p className={styles.weatherDetail}>
                    <strong>Dewpoint (2m): </strong>
                    {weather.dewpoint_2m !== null
                      ? `${weather.dewpoint_2m} °F`
                      : "N/A"}
                  </p>
                )}
                {options[3] && (
                  <p className={styles.weatherDetail}>
                    <strong>Apparent Temperature: </strong>
                    {weather.apparent_temperature !== null
                      ? `${weather.apparent_temperature} °F`
                      : "N/A"}
                  </p>
                )}
                {options[4] && (
                  <p className={styles.weatherDetail}>
                    <strong>Precipitation Probability: </strong>
                    {weather.precipitation_probability !== null
                      ? `${weather.precipitation_probability} %`
                      : "N/A"}
                  </p>
                )}
                {options[5] && (
                  <p className={styles.weatherDetail}>
                    <strong>Precipitation: </strong>
                    {weather.precipitation !== null
                      ? `${weather.precipitation} in`
                      : "N/A"}
                  </p>
                )}
                {options[6] && (
                  <p className={styles.weatherDetail}>
                    <strong>Rain: </strong>
                    {weather.rain !== null ? `${weather.rain} in` : "N/A"}
                  </p>
                )}
                {options[7] && (
                  <p className={styles.weatherDetail}>
                    <strong>Showers: </strong>
                    {weather.showers !== null ? `${weather.showers} in` : "N/A"}
                  </p>
                )}
                {options[8] && (
                  <p className={styles.weatherDetail}>
                    <strong>Snowfall: </strong>
                    {weather.snowfall !== null
                      ? `${weather.snowfall} in`
                      : "N/A"}
                  </p>
                )}
                {options[9] && (
                  <p className={styles.weatherDetail}>
                    <strong>Snow Depth: </strong>
                    {weather.snow_depth !== null
                      ? `${weather.snow_depth} in`
                      : "N/A"}
                  </p>
                )}
                {weather.time && (
                  <p className={styles.weatherDetail}>
                    <strong>Data Time: </strong>
                    {weather.time}
                  </p>
                )}
              </div>
            ) : (
              <p className={styles.noDataMessage}>
                No weather data available. Please search for a location.
              </p>
            )}

            {/* Phone number input */}

            <div className={styles.phoneNumberContainer}>
              <input
                type="text"
                placeholder="Enter phone number"
                className={styles.inputField}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <button className={styles.submitButton}>Send SMS</button>
            </div>
          </div>
          {/* Settings menu */}
          {settings && (
            <div className={styles.settingsContainer}>
              <h1 className={styles.settingsLabel}>Settings</h1>
              <hr />

              {/* Weather options */}
              <div className={styles.checkboxContainer1}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={options[0]}
                  onChange={() => toggleOption(0)}
                />
                <label className={styles.checkboxLabel}>
                  Temperature (2 m)
                </label>

                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={options[1]}
                  onChange={() => toggleOption(1)}
                />
                <label className={styles.checkboxLabel}>
                  Relative Humidity
                </label>

                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={options[2]}
                  onChange={() => toggleOption(2)}
                />
                <label className={styles.checkboxLabel}>Dewpoint (2 m)</label>

                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={options[3]}
                  onChange={() => toggleOption(3)}
                />
                <label className={styles.checkboxLabel}>
                  Apparent Temperature
                </label>

                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={options[4]}
                  onChange={() => toggleOption(4)}
                />
                <label className={styles.checkboxLabel}>
                  Precipitation Probability
                </label>
              </div>

              <div className={styles.checkboxContainer2}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={options[5]}
                  onChange={() => toggleOption(5)}
                />
                <label className={styles.checkboxLabel}>
                  Precipitation (rain + showers + snow)
                </label>

                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={options[6]}
                  onChange={() => toggleOption(6)}
                />
                <label className={styles.checkboxLabel}>Rain</label>

                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={options[7]}
                  onChange={() => toggleOption(7)}
                />
                <label className={styles.checkboxLabel}>Showers</label>

                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={options[8]}
                  onChange={() => toggleOption(8)}
                />
                <label className={styles.checkboxLabel}>Snowfall</label>

                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={options[9]}
                  onChange={() => toggleOption(9)}
                />
                <label className={styles.checkboxLabel}>Snow Depth</label>
              </div>

              {/* Save button for settings */}
              <button className={styles.saveButton} onClick={toggleSettings}>
                Save
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
