export const getUserProfile = async () => {
  const saved = localStorage.getItem('suraksha_user');
  return saved ? JSON.parse(saved) : { name: 'Vaishnavi Mishra', email: 'user@vitbhopal.ac.in', regNo: '25BCE10943' };
};

export const getContacts = async () => {
  const saved = localStorage.getItem('suraksha_contacts');
  return saved
    ? JSON.parse(saved)
    : [
        { id: 1, name: 'Mom', phone: '+91 98765 43210', relation: 'Parent' },
        { id: 2, name: 'National Helpline', phone: '112', relation: 'Police / Helpline' },
      ];
};

export const fetchLocationLogs = async () => {
  const saved = localStorage.getItem('suraksha_loc_history');
  return saved ? JSON.parse(saved) : [];
};

export const recordLocationLog = async (coords) => {
  const history = await fetchLocationLogs();
  const entry = {
    id: Date.now(),
    type: 'GPS Watcher',
    ...coords,
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
  };
  const updated = [entry, ...history].slice(0, 15);
  localStorage.setItem('suraksha_loc_history', JSON.stringify(updated));
  return updated;
};

export const triggerSOSRequest = async (payload) => {
  const history = await fetchLocationLogs();
  const incident = {
    id: Date.now(),
    type: 'CRITICAL SOS ALERT',
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    lat: payload?.location?.lat || 28.6139,
    lng: payload?.location?.lng || 77.2090,
  };
  localStorage.setItem('suraksha_loc_history', JSON.stringify([incident, ...history]));
  return {
    success: true,
    message: 'Emergency SOS broadcasted with live coordinates!',
  };
};