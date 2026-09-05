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
  currentLatitude?: number,
  currentLongitude?: number,
): Promise<PlaceResult[]> {
  if (!query || query.length < 3) return [];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query,
      )}&format=json&addressdetails=1&countrycodes=pk&limit=10`,
      {
        headers: {
          "User-Agent": "rawaan-app/1.0",
        },
      },
    );

    const data = await res.json();

    const places: PlaceResult[] = data
      .filter(
        (item: any) =>
          item.address?.country_code?.toLowerCase() === "pk",
      )
      .map((item: any) => ({
        description: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));

    // If current location is available,
    // sort nearest locations first.
    if (
      currentLatitude !== undefined &&
      currentLongitude !== undefined
    ) {
      places.sort((a, b) => {
        const distanceA = getDistanceInKm(
          currentLatitude,
          currentLongitude,
          a.latitude,
          a.longitude,
        );

        const distanceB = getDistanceInKm(
          currentLatitude,
          currentLongitude,
          b.latitude,
          b.longitude,
        );

        return distanceA - distanceB;
      });
    }

    // Return only the first 6 results after sorting
    return places.slice(0, 6);
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
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
      {
        headers: {
          "User-Agent": "rawaan-app/1.0",
        },
      },
    );

    const data = await res.json();

    return data.display_name || "Unknown location";
  } catch (error) {
    console.log("Reverse geocode error:", error);
    return "Unknown location";
  }
}

