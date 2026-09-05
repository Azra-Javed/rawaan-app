
// Photon (Komoot) — built for search-as-you-type.
// Free public demo server, no API key needed. Keep request volume reasonable;
// self-host if this becomes a high-traffic production app.

export type PlaceResult = {
  description: string;
  latitude: number;
  longitude: number;
};

// Calculate distance between two coordinates in kilometers
function getDistanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function searchPlaces(
  query: string,
  latitude?: number,
  longitude?: number,
): Promise<PlaceResult[]> {
  if (!query || query.length < 1) return [];

  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(
        query,
      )}&limit=50&lang=en`,
    );

    const data = await res.json();

    // Convert Photon results
    const places: PlaceResult[] = (data.features || [])
      .filter((f: any) => {
        const country = f.properties?.country;

        // Only allow Pakistan
        return country?.toLowerCase() === "pakistan";
      })
      .map((f: any) => {
        const props = f.properties;

        const label = [
          props.name,
          props.city,
          props.state,
          props.country,
        ]
          .filter(Boolean)
          .join(", ");

        return {
          description: label,
          latitude: f.geometry.coordinates[1],
          longitude: f.geometry.coordinates[0],
        };
      });

    // If current location is available,
    // sort results by distance from the user.
    if (
      latitude !== undefined &&
      longitude !== undefined
    ) {
      places.sort((a, b) => {
        const distanceA = getDistanceInKm(
          latitude,
          longitude,
          a.latitude,
          a.longitude,
        );

        const distanceB = getDistanceInKm(
          latitude,
          longitude,
          b.latitude,
          b.longitude,
        );

        return distanceA - distanceB;
      });
    }

    // Return only the closest 6 results
    return places.slice(0, 6);
  } catch (err) {
    console.error("Photon search error:", err);
    return [];
  }
}

