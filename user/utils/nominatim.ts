export type PlaceResult = {
  description: string;
  latitude: number;
  longitude: number;
};

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  if (!query || query.length < 3) return [];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query,
      )}&format=json&addressdetails=1&limit=6`,
      { headers: { "User-Agent": "ride-app/1.0 (contact: you@example.com)" } },
    );
    const data = await res.json();

    return data.map((item: any) => ({
      description: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));
  } catch (err) {
    console.error("Nominatim search error:", err);
    return [];
  }
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "User-Agent": "rawaan-app/1.0" } },
    );
    const data = await res.json();
    return data.display_name || "Unknown location";
  } catch (error) {
    console.log("Reverse geocode error:", error);
    return "Unknown location";
  }
}
