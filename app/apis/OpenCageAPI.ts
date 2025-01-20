// api/geolocation.ts

export interface Location {
  lat: number;
  long: number;
}

/**
 * Fetches geolocation data for a given city, state, and country.
 * @param city - The city name.
 * @param state - The state name (optional).
 * @param country - The country name.
 * @param apiKey - Your OpenCage API key.
 * @returns A Location object containing latitude and longitude, or null if not found.
 */
export const fetchGeolocation = async (
  city: string,
  state: string,
  country: string,
  apiKey: string
): Promise<Location | null> => {
  try {
    if (!city || !country) {
      alert("Please enter both city and country.");
      return null;
    }

    let url = `https://api.opencagedata.com/geocode/v1/json?q=${city}`;
    if (state) url += `,+${state}`;
    url += `,+${country}&key=${apiKey}`;

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
