import React, { useState, useEffect } from "react";
import axios from "axios";
import Login from "./components/Login";
import AddSpotForm from "./components/AddSpotForm";
import ParkingList from "./components/ParkingList";
import Notifications from "./components/Notifications";

const API_URL = "http://localhost:4000/api";

function App() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState(""); // USER or ADMIN
  const [spots, setSpots] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const handleLogin = (jwtToken, userRole) => {
    setToken(jwtToken);
    setRole(userRole);
  };

  const handleLogout = () => {
    setToken("");
    setRole("");
    setSpots([]);
    setNotifications([]);
  };

  const fetchSpots = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/spots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpots(res.data);
    } catch (err) {
      console.error("Failed to fetch spots", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSpots();
      const interval = setInterval(fetchSpots, 5000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // WebSocket for notifications
  useEffect(() => {
    if (!token) return;
    const ws = new WebSocket("ws://localhost:5000/notifications");
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setNotifications((prev) => [msg, ...prev]);
      if (msg.type === "ParkingSpotUpdated") {
        setSpots((prev) =>
          prev.map((s) => (s.id === msg.spotId ? { ...s, status: msg.status } : s))
        );
      }
    };
    ws.onerror = (err) => console.error("WebSocket error", err);
    return () => ws.close();
  }, [token]);

  const addSpot = async (spot) => {
    if (!token) return;
    try {
      const res = await axios.post(`${API_URL}/spots`, spot, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSpots((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Failed to add spot", err);
    }
  };

  const updateSpot = async (spot) => {
    if (!token) return;
    const newStatus = spot.status === "FREE" ? "OCCUPIED" : "FREE";
    try {
      await axios.post(
        `${API_URL}/spots/${spot.id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSpots((prev) =>
        prev.map((s) => (s.id === spot.id ? { ...s, status: newStatus } : s))
      );
    } catch (err) {
      console.error("Failed to update spot", err);
    }
  };

  if (!token) return <Login onLogin={handleLogin} />;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Parking Spot Monitor</h1>
      <p>
        Logged in as <strong>{role}</strong>{" "}
        <button onClick={handleLogout}>Logout</button>
      </p>
      {role === "ADMIN" && <AddSpotForm onAdd={addSpot} />}
      <ParkingList spots={spots} onToggle={updateSpot} />
      <Notifications notifications={notifications} />
    </div>
  );
}

export default App;
