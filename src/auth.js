import { createContext, useContext } from 'react';
export const AuthCtx = createContext({ user: null, setUser: () => {}, ready: false });
export const useAuth = () => useContext(AuthCtx);
