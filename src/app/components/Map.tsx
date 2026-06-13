import { SetStateAction, useEffect, useRef } from "react";
import { WebView } from "react-native-webview";

type MapProps = {
    mode: "pickup" | "dropoff";
    setDistance: React.Dispatch<SetStateAction<number | null>>;
    setDuration: React.Dispatch<SetStateAction<number | null>>;
    pickupCoords: { latitude: number; longitude: number } | null;
    dropoffCoords: { latitude: number; longitude: number } | null;
    onLocationSelect: (
        latitude: number,
        longitude: number,
        type: "pickup" | "dropoff"
    ) => void;
};

export default function MapScreen({mode, setDuration, setDistance, pickupCoords, dropoffCoords, onLocationSelect }: MapProps) {

  useEffect(() => {
    webRef.current?.injectJavaScript(`
      currentMode = "${mode}";
      true;
    `);
  }, [mode]);

  const webRef = useRef<WebView>(null);

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
    <style>
      html, body, #map {
        height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
      }
    </style>
  </head>

  <body>
    <div id="map"></div>

    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    <script>
      async function drawRoute() {
        if (!pickupMarker || !dropoffMarker) {
          return;
        }

        try {
          const pickup = pickupMarker.getLatLng();
          const dropoff = dropoffMarker.getLatLng();

          const url =
            "https://router.project-osrm.org/route/v1/driving/" +
            pickup.lng + "," + pickup.lat + ";" +
            dropoff.lng + "," + dropoff.lat +
            "?overview=full&geometries=geojson";

          const response = await fetch(url);
          const data = await response.json();

          if (!data.routes || data.routes.length === 0) {
            return;
          }

          const route = data.routes[0];

          const coordinates = route.geometry.coordinates;

          const latLngs = coordinates.map(coord => [
            coord[1],
            coord[0]
          ]);

          if (routeLine) {
            map.removeLayer(routeLine);
          }

          routeLine = L.polyline(latLngs, {
            color: "#2196F3",
            weight: 5,
            opacity: 0.8
          }).addTo(map);

          map.fitBounds(routeLine.getBounds(), {
            padding: [50, 50]
          });

          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "route",
            distance: route.distance,
            duration: route.duration,
          }));

        } catch (error) {
          console.log(error);
        }
      }

      const map = L.map('map').setView([14.5995, 120.9842], 13);

      const pickupIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      const dropoffIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      let pickupMarker = null;
      let dropoffMarker = null;
      let routeLine = null; 
      let currentMode = "pickup";

      map.on('click', function(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      if (currentMode === "pickup") {
        if (pickupMarker) {
          map.removeLayer(pickupMarker);
        }

        pickupMarker = L.marker(
          [lat, lng],
          { icon: pickupIcon }
        ).addTo(map);

      } else {
        if (dropoffMarker) {
          map.removeLayer(dropoffMarker);
        }

        dropoffMarker = L.marker(
          [lat, lng],
          { icon: dropoffIcon }
        ).addTo(map);
      }

      drawRoute();

      window.ReactNativeWebView.postMessage(JSON.stringify({
        latitude: lat,
        longitude: lng,
        type: currentMode,
      }));
    });

    </script>
  </body>
  </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "route") {
        setDistance(data.distance);
        setDuration(data.duration);
        return;
      }

      onLocationSelect(
        data.latitude,
        data.longitude,
        data.type
      );

    } catch {
      console.log("Invalid message");
    }
  };

  return (
    <WebView
      ref={webRef}
      source={{ html }}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={["*"]}
      onMessage={handleWebViewMessage}
    />
  );
}