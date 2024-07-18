import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

interface PrivateRouteProps {
  element: React.ReactElement;
  path?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const { user } = useAuth();
  const location = useLocation();

  return user ? element : <Navigate to="/login" state={{ from: location }} />;
};

export default PrivateRoute;
