// ─────────────────────────────────────────────────────────────
// Google OAuth — Client-Side Only (Google Identity Services)
//
// To enable real Google login:
//  1. Go to https://console.cloud.google.com/
//  2. Create a project → APIs & Services → Credentials
//  3. Create OAuth 2.0 Client ID → Web application
//  4. Add  http://localhost:5173  to "Authorized JavaScript origins"
//  5. Replace the string below with your actual Client ID
// ─────────────────────────────────────────────────────────────
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (document.getElementById('google-gsi-script')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Decode JWT returned by Google (no library needed)
export function decodeJWT(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Returns a promise that resolves with { name, email, picture, sub }
export function signInWithGoogle() {
  return new Promise((resolve, reject) => {
    if (!window.google) { reject(new Error('Google script not loaded')); return; }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        const payload = decodeJWT(response.credential);
        if (payload) {
          resolve({
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            googleId: payload.sub,
          });
        } else {
          reject(new Error('Failed to decode token'));
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
        reject(new Error('dismissed'));
      }
    });
  });
}

export function signOutGoogle() {
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }
}