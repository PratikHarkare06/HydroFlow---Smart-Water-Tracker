
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const sendNotification = (title: string, body: string): boolean => {
  // If permission granted, try system notification
  if (Notification.permission === 'granted') {
    try {
      // Try to use Service Worker for better background handling on Android
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3105/3105807.png',
            vibrate: [200, 100, 200],
            tag: 'hydration-reminder',
            renotify: true,
            actions: [
              { action: 'drink', title: 'I Drank Water' },
              { action: 'close', title: 'Dismiss' }
            ]
          } as any);
        });
      } else {
        // Fallback for desktop / simple notification
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3105/3105807.png',
          vibrate: [200, 100, 200],
          tag: 'hydration-reminder'
        } as any);
      }
      
      playNotificationSound();
      return true; // Sent successfully
    } catch (e) {
      console.error("System notification failed", e);
      return false; // Failed
    }
  }
  
  return false; // Not granted
};
