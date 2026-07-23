import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { loginRequest, logoutRequest, registerRequest } from "../api/auth.api";
import { refreshSession } from "../api/client";
import { subscribeToAuthEvents } from "../services/authEvents";

const AuthContext = createContext(null);
const USER_STORAGE_KEY = "leaveflow:user";

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  const clearSession = useCallback((message) => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    queryClient.clear();
    if (message) toast.error(message);
  }, [queryClient]);

  useEffect(() => {
    const restoreSession = async () => {
      const storedUser = getStoredUser();
      if (!storedUser) {
        setIsLoading(false);
        return;
      }
      try {
        await refreshSession();
        setUser(storedUser);
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
    return subscribeToAuthEvents((event) => clearSession(event === "session-expired" ? "Your session has expired. Please sign in again." : null));
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const { data } = await loginRequest(credentials);
    const loggedInUser = data.data.user;
    queryClient.clear();
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }, [queryClient]);

  const register = useCallback(async (payload) => {
    const { data } = await registerRequest(payload);
    const registeredUser = data.data.user;
    queryClient.clear();
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(registeredUser));
    setUser(registeredUser);
    return registeredUser;
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Clear local state even if the server is unavailable.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const updateUser = useCallback((partial) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...partial };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ user, isLoading, isAuthenticated: Boolean(user), login, register, logout, updateUser }), [user, isLoading, login, register, logout, updateUser]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
