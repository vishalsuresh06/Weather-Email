// api/weather.ts

export interface Weather {
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

/**
 * Fetches weather data for a given location and selected options.
 * @param coords - The latitude and longitude of the location.
 * @param options - An array of booleans indicating which weather fields to include.
 * @returns A Weather object containing the requested weather data, or null if not found.
 */
export const fetchWeather = async (
  coords: { lat: number; long: number },
  options: boolean[]
): Promise<Weather | null> => {
  try {
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
