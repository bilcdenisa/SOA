import React, { useState } from "react";

export default function AddSpotForm({ onAdd }) {
  const [number, setNumber] = useState("");
  const [occupied, setOccupied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!number) return;
    onAdd({ number, status: occupied ? "OCCUPIED" : "FREE" });
    setNumber("");
    setOccupied(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Spot Number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
      />
      <label style={{ marginLeft: "10px" }}>
        Occupied
        <input
          type="checkbox"
          checked={occupied}
          onChange={(e) => setOccupied(e.target.checked)}
        />
      </label>
      <button type="submit" style={{ marginLeft: "10px" }}>
        Add Spot
      </button>
    </form>
  );
}
