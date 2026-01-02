import React from "react";

export default function Notifications({ notifications }) {
  if (!notifications || notifications.length === 0) return null;

  return (
    <div style={{ marginTop: "20px" }}>
      <h2>Live Notifications</h2>
      <ul>
        {notifications.map((msg, idx) => (
          <li key={idx}>
            Spot {msg.number} {msg.type === "ParkingSpotUpdated" ? msg.status : "changed"} at{" "}
            {new Date(msg.timestamp).toLocaleTimeString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
