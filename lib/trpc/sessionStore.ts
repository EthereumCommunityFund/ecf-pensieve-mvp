// This is a simple, non-React store to hold the session token.
// It helps us break the circular dependency between AuthProvider and TRPCProvider.

import {
  safeGetLocalStorage,
  safeRemoveLocalStorage,
  safeSetLocalStorage,
} from '@/utils/localStorage';

const SESSION_TOKEN_KEY = 'pensieve_session_token';

export const setSessionToken = (token: string | null) => {
  if (token) {
    safeSetLocalStorage(SESSION_TOKEN_KEY, token);
  } else {
    safeRemoveLocalStorage(SESSION_TOKEN_KEY);
  }
};

export const getSessionToken = () => {
  return safeGetLocalStorage(SESSION_TOKEN_KEY);
};
