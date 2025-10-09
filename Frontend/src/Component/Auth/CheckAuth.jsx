import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * CheckAuth Component for Neptune Water Quality Monitoring System
 * 
 * Handles authentication and role-based routing for:
 * - Admin users (staff with admin privileges) - stored in localStorage as "admin"
 * - Seller users (staff with seller privileges) - stored in localStorage as "sellerStaff" 
 * - Client users (tank owners) - stored in localStorage as "tankId" + "loggedTank"
 * 
 * Authentication is checked using localStorage:
 * - "admin": Admin staff data (JSON)
 * - "sellerStaff": Seller staff data (JSON)
 * - "tankId" + "loggedTank": Client tank data
 */

function CheckAuth({ children }) {
  const location = useLocation();

  // Helper functions to check authentication status
  const isAdminAuthenticated = () => {
    try {
      const adminData = localStorage.getItem("admin");
      return adminData && JSON.parse(adminData);
    } catch {
      return false;
    }
  };

  const isSellerAuthenticated = () => {
    try {
      const sellerData = localStorage.getItem("sellerStaff");
      return sellerData && JSON.parse(sellerData);
    } catch {
      return false;
    }
  };

  const isClientAuthenticated = () => {
    try {
      const tankId = localStorage.getItem("tankId");
      const loggedTank = localStorage.getItem("loggedTank");
      return tankId && loggedTank && JSON.parse(loggedTank);
    } catch {
      return false;
    }
  };

  const getCurrentUser = () => {
    if (isAdminAuthenticated()) {
      return { role: "admin", data: JSON.parse(localStorage.getItem("admin")) };
    }
    if (isSellerAuthenticated()) {
      return { role: "seller", data: JSON.parse(localStorage.getItem("sellerStaff")) };
    }
    if (isClientAuthenticated()) {
      return { 
        role: "client", 
        data: JSON.parse(localStorage.getItem("loggedTank")),
        tankId: localStorage.getItem("tankId")
      };
    }
    return null;
  };

  const isAuthenticated = () => {
    return isAdminAuthenticated() || isSellerAuthenticated() || isClientAuthenticated();
  };

  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();

  console.log("Auth Check:", {
    path: location.pathname,
    authenticated,
    role: currentUser?.role,
    user: currentUser?.data?.id || currentUser?.tankId
  });

  // Admin-only routes
  const adminRoutes = [
    "/admin/dashboard",
    "/admin/orders", 
    "/admin/statistics",
    "/admin/products",
    "/admin/stock",
    "/admin/offers",
    "/admin/issues",
    "/staffs",
    "/staffs/add",
    "/staffs/edit",
    "/adduser",
    "/userdetails",
    "/users",
    "/tanks",
    "/sellers",
    "/add-tank"
  ];

  // Seller-only routes
  const sellerRoutes = [
    "/seller/dashboard"
  ];

  // Client-only routes
  const clientRoutes = [
    "/homepage",
    "/client/water-quality",
    "/client/water-level", 
    "/client/billing"
  ];

  // Tank-specific routes (require tankId parameter)
  const tankSpecificRoutes = [
    "/tank/",
    "/water-quality/add/",
    "/water-quality/edit/",
    "/water-level/add/",
    "/water-level/edit/",
    "/water-level-chart/",
    "/water-quality-chart/",
    "/issues/",
    "/invoice/"
  ];

  // Helper function to check if route matches pattern
  const routeMatches = (path, patterns) => {
    return patterns.some(pattern => path.includes(pattern));
  };

  // Handle root path redirects
  if (location.pathname === "/") {
    if (!authenticated) {
      return <Navigate to="/login" replace />;
    } else {
      // Redirect based on user role
      switch (currentUser.role) {
        case "admin":
          return <Navigate to="/admin/dashboard" replace />;
        case "seller":
          return <Navigate to="/seller/dashboard" replace />;
        case "client":
          return <Navigate to="/homepage" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
  }

  // Handle login/register page redirects
  if (location.pathname === "/login" || location.pathname === "/regi") {
    if (authenticated) {
      // Redirect authenticated users away from login/register
      switch (currentUser.role) {
        case "admin":
          return <Navigate to="/admin/dashboard" replace />;
        case "seller":
          return <Navigate to="/seller/dashboard" replace />;
        case "client":
          return <Navigate to="/homepage" replace />;
        default:
          return <Navigate to="/" replace />;
      }
    }
    // Allow access to login/register for unauthenticated users
    return <>{children}</>;
  }

  // Check if user is authenticated for protected routes
  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (currentUser.role === "admin") {
    // Admin can access admin routes and most other routes
    if (routeMatches(location.pathname, sellerRoutes)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
  } else if (currentUser.role === "seller") {
    // Seller can only access seller routes and some general routes
    if (routeMatches(location.pathname, adminRoutes)) {
      return <Navigate to="/login" replace />;
    }
    if (routeMatches(location.pathname, clientRoutes)) {
      return <Navigate to="/seller/dashboard" replace />;
    }
  } else if (currentUser.role === "client") {
    // Client can only access client routes and tank-specific routes for their tank
    if (routeMatches(location.pathname, adminRoutes) || routeMatches(location.pathname, sellerRoutes)) {
      return <Navigate to="/login" replace />;
    }
    
    // For tank-specific routes, verify the tankId matches
    if (routeMatches(location.pathname, tankSpecificRoutes)) {
      const pathTankId = location.pathname.match(/\/tank\/([^/]+)/)?.[1] || 
                       location.pathname.match(/\/add\/([^/]+)/)?.[1] ||
                       location.pathname.match(/\/edit\/([^/]+)/)?.[1] ||
                       location.pathname.match(/\/chart\/([^/]+)/)?.[1] ||
                       location.pathname.match(/\/issues\/([^/]+)/)?.[1] ||
                       location.pathname.match(/\/invoice\/([^/]+)/)?.[1];
      
      if (pathTankId && pathTankId !== currentUser.tankId) {
        return <Navigate to="/login" replace />;
      }
    }
  }

  // If all checks pass, render the protected component
  return <>{children}</>;
}

export default CheckAuth;
