import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // 🔥 check localStorage role for persistence
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("role")
  );

  // 🔥 sync on refresh
  useEffect(() => {
    const role = localStorage.getItem("role");
    setIsAuthenticated(!!role);
  }, []);

  const login = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("role"); // 🔥 important
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};