import React from "react";

export default function ParkingList({ spots, onToggle }) {
  if (!spots || spots.length === 0) return <p>No parking spots.</p>;

  return (
    <ul>
      {spots.map((spot) => (
        <li key={spot.id} style={{ marginBottom: "5px" }}>
          Spot {spot.number || spot.id}: {spot.status || "FREE"}{" "}
          {spot.updatedAt && <small>(updated {new Date(spot.updatedAt).toLocaleTimeString()})</small>}
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => onToggle(spot)}
          >
            {spot.status === "FREE" ? "Occupy" : "Free"}
          </button>
        </li>
      ))}
    </ul>
  );
}
