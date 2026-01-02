import { v4 as uuid } from "uuid";

/**
 * in-memory store
 * spotId -> { number, status, updatedAt }
 */
const spots = new Map();

export function getAllSpots() {
  return Array.from(spots.entries()).map(([id, data]) => ({
    id,
    ...data
  }));
}

export function updateSpot(id, status) {
  const existing = spots.get(id);

  if (existing?.status === status) {
    return null;
  }

  const updated = {
    ...existing,
    status,
    updatedAt: new Date().toISOString()
  };

  spots.set(id, updated);
  return updated;
}

export function addSpot({ number, status = "free" }) {
  const id = uuid();
  const newSpot = {
    number,
    status,
    updatedAt: new Date().toISOString()
  };
  spots.set(id, newSpot);
  return { id, ...newSpot };
}
