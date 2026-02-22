import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = useSelector((state) => state.user);

  if (!user) return <p>Loading...</p>;

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
