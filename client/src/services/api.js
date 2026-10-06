// Backend URL. Override with VITE_API_URL in client/.env for deployment.
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export const signupUser = async (userData) => {
  const response = await fetch(`${API_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
};

export const loginUser = async (userData) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
};

export const getUserProfile = async () => {
  const saved = localStorage.getItem("suraksha_user");
  return saved
    ? JSON.parse(saved)
    : {
        name: "Vaishnavi Mishra",
        email: "user@vitbhopal.ac.in",
        regNo: "25BCE10943",
      };
};

export const getContacts = async () => {
  const saved = localStorage.getItem("suraksha_contacts");

  return saved
    ? JSON.parse(saved)
    : [
        {
          id: 1,
          name: "Mom",
          phone: "+91 98765 43210",
          relation: "Parent",
        },
        {
          id: 2,
          name: "National Helpline",
          phone: "112",
          relation: "Police / Helpline",
        },
      ];
};

export const fetchLocationLogs = async () => {
  const saved = localStorage.getItem("suraksha_loc_history");
  return saved ? JSON.parse(saved) : [];
};

export const recordLocationLog = async (coords) => {
  const history = await fetchLocationLogs();

  const entry = {
    id: Date.now(),
    type: "GPS Watcher",
    ...coords,
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
  };

  const updated = [entry, ...history].slice(0, 15);

  localStorage.setItem(
    "suraksha_loc_history",
    JSON.stringify(updated)
  );

  return updated;
};

// POST /api/sos
// Sends the SOS payload (user, coordinates, trigger source) to the backend,
// which fetches the user's contacts, sends the SMS alerts and logs the alert.
// Accepts { location: { lat, lng }, triggerSource } or { latitude, longitude }.
export const triggerSOSRequest = async (payload = {}) => {
  let user;
  try {
    user = JSON.parse(localStorage.getItem("suraksha_user"));
  } catch {
    user = undefined;
  }

  const userId = user?.id;
  const latitude = payload?.latitude ?? payload?.location?.lat;
  const longitude = payload?.longitude ?? payload?.location?.lng;

  if (!userId) {
    throw new Error("User ID not found. Please login again.");
  }

  if (latitude === undefined || longitude === undefined) {
    throw new Error("Location not available.");
  }

  const response = await fetch(`${API_URL}/api/sos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      latitude,
      longitude,
      triggerSource: payload?.triggerSource || "MANUAL",
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.message || "SOS request failed");
    err.code = data.code; // e.g. NO_CONTACTS, SMS_FAILED
    throw err;
  }

  return { success: true, ...data };
};

// GET /api/sos/history/:userId - saved alert history with timestamps
export const getSosHistory = async (userId) => {
  const response = await fetch(`${API_URL}/api/sos/history/${userId}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to load SOS history");
  }
  return data.alerts;
};

export const addContact = async (
  userId,
  name,
  phone,
  relationship
) => {
  const response = await fetch(`${API_URL}/api/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      name,
      phone,
      relationship,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to add emergency contact"
    );
  }

  return data.contact;
};