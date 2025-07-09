// This is a simple, non-React store to hold the session token.
// It helps us break the circular dependency between AuthProvider and TRPCProvider.

let sessionToken: string | null = null;

export const setSessionToken = (token: string | null) => {
  sessionToken = token;
};

export const getSessionToken = () => {
  return sessionToken;
};
