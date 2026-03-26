import { createContext, useState, useEffect } from "react";
import { getToken, saveToken, removeToken } from "../utils/authStorage";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

 useEffect(() => {
  const token = getToken();
  setIsAuthenticated(!!token);
}, []);

  const login = (data) => {
  saveToken(data.token);   // backend token
  setIsAuthenticated(true);
};


  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
