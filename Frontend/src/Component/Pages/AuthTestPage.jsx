import React from "react";

function AuthTestPage() {
  const checkAuth = () => {
    console.log("=== AUTHENTICATION TEST ===");
    console.log("localStorage admin:", localStorage.getItem("admin"));
    console.log("localStorage sellerStaff:", localStorage.getItem("sellerStaff"));
    console.log("localStorage tankId:", localStorage.getItem("tankId"));
    console.log("localStorage loggedTank:", localStorage.getItem("loggedTank"));
    
    // Test authentication functions
    const adminData = localStorage.getItem("admin");
    const sellerData = localStorage.getItem("sellerStaff");
    const tankId = localStorage.getItem("tankId");
    const loggedTank = localStorage.getItem("loggedTank");
    
    console.log("Admin authenticated:", adminData ? JSON.parse(adminData) : false);
    console.log("Seller authenticated:", sellerData ? JSON.parse(sellerData) : false);
    console.log("Client authenticated:", tankId && loggedTank ? JSON.parse(loggedTank) : false);
    console.log("===========================");
  };

  const simulateLogin = (type) => {
    if (type === "admin") {
      localStorage.setItem("admin", JSON.stringify({ id: "admin1", name: "Admin User" }));
    } else if (type === "seller") {
      localStorage.setItem("sellerStaff", JSON.stringify({ id: "seller1", name: "Seller User" }));
    } else if (type === "client") {
      localStorage.setItem("tankId", "TNK-001");
      localStorage.setItem("loggedTank", JSON.stringify({ tankId: "TNK-001", name: "Test Tank" }));
    }
    console.log(`Simulated ${type} login`);
  };

  const clearAuth = () => {
    localStorage.removeItem("admin");
    localStorage.removeItem("sellerStaff");
    localStorage.removeItem("tankId");
    localStorage.removeItem("loggedTank");
    console.log("Cleared all authentication data");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Authentication Test Page</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <h3>Current Authentication Status:</h3>
        <button onClick={checkAuth} style={{ padding: "10px", margin: "5px" }}>
          Check Auth Status
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Simulate Login:</h3>
        <button onClick={() => simulateLogin("admin")} style={{ padding: "10px", margin: "5px" }}>
          Login as Admin
        </button>
        <button onClick={() => simulateLogin("seller")} style={{ padding: "10px", margin: "5px" }}>
          Login as Seller
        </button>
        <button onClick={() => simulateLogin("client")} style={{ padding: "10px", margin: "5px" }}>
          Login as Client
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Clear Authentication:</h3>
        <button onClick={clearAuth} style={{ padding: "10px", margin: "5px", backgroundColor: "#ff4444", color: "white" }}>
          Clear All Auth Data
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Test Protected Routes:</h3>
        <a href="/sellers" style={{ padding: "10px", margin: "5px", display: "inline-block", backgroundColor: "#007bff", color: "white", textDecoration: "none" }}>
          Try /sellers (Admin only)
        </a>
        <a href="/homepage" style={{ padding: "10px", margin: "5px", display: "inline-block", backgroundColor: "#28a745", color: "white", textDecoration: "none" }}>
          Try /homepage (Client only)
        </a>
        <a href="/seller/dashboard" style={{ padding: "10px", margin: "5px", display: "inline-block", backgroundColor: "#ffc107", color: "black", textDecoration: "none" }}>
          Try /seller/dashboard (Seller only)
        </a>
      </div>

      <div style={{ backgroundColor: "#f8f9fa", padding: "15px", borderRadius: "5px" }}>
        <h4>Instructions:</h4>
        <ol>
          <li>Open browser console to see debug logs</li>
          <li>Click "Check Auth Status" to see current authentication</li>
          <li>Click "Clear All Auth Data" to simulate logout</li>
          <li>Try accessing protected routes - should redirect to login</li>
          <li>Simulate a login and try again - should work based on role</li>
        </ol>
      </div>
    </div>
  );
}

export default AuthTestPage;
