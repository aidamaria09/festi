import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type { Festival } from "../types";
import "./FestivalMap.css";

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function FestivalMap({ festivals }: { festivals: Festival[] }) {
  return (
    <div className="festival-map">
      <MapContainer center={[47, 10]} zoom={4} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {festivals.map((festival) => (
          <Marker key={festival.id} position={[festival.lat, festival.lng]} icon={defaultIcon}>
            <Popup>
              <a href={festival.url} target="_blank" rel="noopener noreferrer">
                {festival.name}
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
