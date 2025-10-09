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
      const parsed = adminData ? JSON.parse(adminData) : null;
      console.log("Admin auth check:", { adminData, parsed });
      return parsed;
    } catch (error) {
      console.log("Admin auth error:", error);
      return false;
    }
  };

  const isSellerAuthenticated = () => {
    try {
      const sellerData = localStorage.getItem("sellerStaff");
      const parsed = sellerData ? JSON.parse(sellerData) : null;
      console.log("Seller auth check:", { sellerData, parsed });
      return parsed;
    } catch (error) {
      console.log("Seller auth error:", error);
      return false;
    }
  };

  const isClientAuthenticated = () => {
    try {
      const tankId = localStorage.getItem("tankId");
      const loggedTank = localStorage.getItem("loggedTank");
      const parsed = loggedTank ? JSON.parse(loggedTank) : null;
      console.log("Client auth check:", { tankId, loggedTank, parsed });
      return tankId && parsed;
    } catch (error) {
      console.log("Client auth error:", error);
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
    const auth = isAdminAuthenticated() || isSellerAuthenticated() || isClientAuthenticated();
    console.log("Overall auth check:", auth);
    return auth;
  };

  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();

  console.log("=== AUTH CHECK DEBUG ===");
  console.log("Path:", location.pathname);
  console.log("Authenticated:", authenticated);
  console.log("Current User:", currentUser);
  console.log("localStorage admin:", localStorage.getItem("admin"));
  console.log("localStorage sellerStaff:", localStorage.getItem("sellerStaff"));
  console.log("localStorage tankId:", localStorage.getItem("tankId"));
  console.log("localStorage loggedTank:", localStorage.getItem("loggedTank"));
  console.log("=========================");

  // Show alert for debugging
  if (location.pathname === "/sellers") {
    alert(`Trying to access /sellers\nAuthenticated: ${authenticated}\nUser: ${currentUser?.role || 'none'}\nAdmin data: ${localStorage.getItem("admin") || 'none'}`);
  }

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
      console.log("Root path: Not authenticated, redirecting to login");
      return <Navigate to="/login" replace />;
    } else {
      console.log("Root path: Authenticated, redirecting based on role:", currentUser.role);
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
      console.log("Login/Register: Already authenticated, redirecting based on role:", currentUser.role);
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
    console.log("Login/Register: Not authenticated, allowing access");
    // Allow access to login/register for unauthenticated users
    return <>{children}</>;
  }

  // Check if user is authenticated for protected routes
  if (!authenticated) {
    console.log("Protected route: Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("Protected route: Authenticated, checking role permissions");

  // Role-based access control
  if (currentUser.role === "admin") {
    console.log("Admin user: Checking route permissions");
    // Admin can access admin routes and most other routes
    if (routeMatches(location.pathname, sellerRoutes)) {
      console.log("Admin trying to access seller route, redirecting to admin dashboard");
      return <Navigate to="/admin/dashboard" replace />;
    }
  } else if (currentUser.role === "seller") {
    console.log("Seller user: Checking route permissions");
    // Seller can only access seller routes and some general routes
    if (routeMatches(location.pathname, adminRoutes)) {
      console.log("Seller trying to access admin route, redirecting to login");
      return <Navigate to="/login" replace />;
    }
    if (routeMatches(location.pathname, clientRoutes)) {
      console.log("Seller trying to access client route, redirecting to seller dashboard");
      return <Navigate to="/seller/dashboard" replace />;
    }
  } else if (currentUser.role === "client") {
    console.log("Client user: Checking route permissions");
    // Client can only access client routes and tank-specific routes for their tank
    if (routeMatches(location.pathname, adminRoutes) || routeMatches(location.pathname, sellerRoutes)) {
      console.log("Client trying to access admin/seller route, redirecting to login");
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
      
      console.log("Tank-specific route check:", { pathTankId, userTankId: currentUser.tankId });
      if (pathTankId && pathTankId !== currentUser.tankId) {
        console.log("Client trying to access wrong tank, redirecting to login");
        return <Navigate to="/login" replace />;
      }
    }
  }

  console.log("All checks passed, rendering protected component");
  // If all checks pass, render the protected component
  return <>{children}</>;
}

export default CheckAuth;