import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RoleRoute({ children, role }) {
  const { isAuthenticated } = useContext(AuthContext);

  const userRole = localStorage.getItem("role");

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" />;
  }

  return children;
}