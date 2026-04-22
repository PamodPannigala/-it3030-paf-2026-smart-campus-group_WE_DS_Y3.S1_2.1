import { useCallback } from 'react';

/**
 * Custom hook to handle Browser Push Notifications.
 * Note: This implements the native Web Notification API.
 */
const usePushNotifications = () => {
  
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.warn("This browser does not support desktop notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }, []);

  const showNotification = useCallback((title, options = {}) => {
    if (Notification.permission === "granted") {
      const defaultOptions = {
        icon: '/favicon.ico', // Replace with your logo path
        badge: '/favicon.ico',
        ...options
      };
      
      const notification = new Notification(title, defaultOptions);
      
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (options.url) {
          window.location.href = options.url;
        }
        notification.close();
      };
    }
  }, []);

  return { requestPermission, showNotification, permission: Notification.permission };
};

export default usePushNotifications;
