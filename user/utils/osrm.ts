import polyline from "@mapbox/polyline";

export type Coord = { latitude: number; longitude: number };

export async function getRoute(origin: Coord, destination: Coord) {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=polyline`,
    );
    const data = await res.json();

    if (!data.routes?.length) return null;

    const points = polyline.decode(data.routes[0].geometry);
    const coords: Coord[] = points.map(([lat, lng]: [number, number]) => ({
      latitude: lat,
      longitude: lng,
    }));

    return {
      coords,
      distanceKm: data.routes[0].distance / 1000,
      durationMin: data.routes[0].duration / 60,
    };
  } catch (err) {
    console.error("OSRM route error:", err);
    return null;
  }
}
