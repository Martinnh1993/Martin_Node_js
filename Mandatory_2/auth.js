export const sendIdTokenToServer = (idToken) => {
    return fetch('/sessionLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      }
    });
  };
  