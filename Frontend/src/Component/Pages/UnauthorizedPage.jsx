import React from "react";
import { Link } from "react-router-dom";

/**
 * Unauthorized Page Component
 * Displayed when users try to access routes they don't have permission for
 */
function UnauthorizedPage() {
  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0b1020 0%, #0d1519 35%, #101826 100%)",
      color: "#e5e7eb",
      fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    },
    container: {
      textAlign: "center",
      maxWidth: "600px",
      padding: "40px 20px",
      background: "rgba(17,24,39,0.72)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "16px",
      boxShadow: "0 20px 50px rgba(0,0,0,.35)",
      backdropFilter: "blur(12px)",
    },
    icon: {
      fontSize: "80px",
      marginBottom: "20px",
      filter: "drop-shadow(0 0 20px rgba(239,68,68,0.3))",
    },
    title: {
      fontSize: "32px",
      fontWeight: "900",
      margin: "0 0 16px 0",
      color: "#ef4444",
    },
    subtitle: {
      fontSize: "18px",
      margin: "0 0 24px 0",
      color: "#9aa3b2",
      lineHeight: "1.6",
    },
    description: {
      fontSize: "16px",
      margin: "0 0 32px 0",
      color: "#cbd5e1",
      lineHeight: "1.6",
    },
    buttonGroup: {
      display: "flex",
      gap: "16px",
      justifyContent: "center",
      flexWrap: "wrap",
    },
    button: {
      padding: "12px 24px",
      borderRadius: "10px",
      border: "none",
      fontWeight: "700",
      fontSize: "16px",
      cursor: "pointer",
      textDecoration: "none",
      display: "inline-block",
      transition: "all 0.2s ease",
    },
    primaryButton: {
      background: "linear-gradient(135deg, rgba(59,130,246,1), rgba(16,185,129,1))",
      color: "#0b1020",
      boxShadow: "0 10px 24px rgba(59,130,246,.28)",
    },
    secondaryButton: {
      background: "rgba(2,6,23,.6)",
      color: "#e5e7eb",
      border: "1px solid rgba(148,163,184,.35)",
    },
  };

  const getCurrentUserRole = () => {
    try {
      if (localStorage.getItem("admin")) return "admin";
      if (localStorage.getItem("sellerStaff")) return "seller";
      if (localStorage.getItem("tankId")) return "client";
    } catch {
      return null;
    }
    return null;
  };

  const getDashboardPath = () => {
    const role = getCurrentUserRole();
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "seller":
        return "/seller/dashboard";
      case "client":
        return "/homepage";
      default:
        return "/login";
    }
  };

  const role = getCurrentUserRole();
  const dashboardPath = getDashboardPath();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.icon}>🚫</div>
        <h1 style={styles.title}>Access Denied</h1>
        <h2 style={styles.subtitle}>You don't have permission to access this page</h2>
        <p style={styles.description}>
          The page you're trying to access requires different permissions than what your account has. 
          Please contact your administrator if you believe this is an error.
        </p>
        
        <div style={styles.buttonGroup}>
          <Link 
            to={dashboardPath} 
            style={{...styles.button, ...styles.primaryButton}}
          >
            Go to Dashboard
          </Link>
          
          <Link 
            to="/login" 
            style={{...styles.button, ...styles.secondaryButton}}
            onClick={() => {
              // Clear all auth data
              localStorage.removeItem("admin");
              localStorage.removeItem("sellerStaff");
              localStorage.removeItem("tankId");
              localStorage.removeItem("loggedTank");
            }}
          >
            Switch Account
          </Link>
        </div>

        {role && (
          <div style={{
            marginTop: "24px",
            padding: "12px 16px",
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#93c5fd"
          }}>
            Current Role: <strong>{role.toUpperCase()}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default UnauthorizedPage;
