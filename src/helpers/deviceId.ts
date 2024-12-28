export const getDeviceId = (): string => {
  const storageKey = 'device_id';
  let deviceId = localStorage.getItem(storageKey);
  
  if (!deviceId) {
    deviceId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(storageKey, deviceId);
  }
  
  return deviceId;
} 