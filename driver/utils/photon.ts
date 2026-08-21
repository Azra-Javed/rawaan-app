// Photon (Komoot) — built for search-as-you-type, unlike Nominatim.
// Free public demo server, no API key needed. Keep request volume reasonable;
// self-host if this becomes a high-traffic production app.

export type PlaceResult = {
  description: string;
  latitude: number;
  longitude: number;
};

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  if (!query || query.length < 3) return [];

  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6`,
    );
    const data = await res.json();

    return (data.features || []).map((f: any) => {
      const props = f.properties;
      const label = [props.name, props.city, props.state, props.country]
        .filter(Boolean)
        .join(", ");

      return {
        description: label,
        latitude: f.geometry.coordinates[1], // GeoJSON: [lng, lat]
        longitude: f.geometry.coordinates[0],
      };
    });
  } catch (err) {
    console.error("Photon search error:", err);
    return [];
  }
}
