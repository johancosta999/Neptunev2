import React from "react";
import { Link, useParams } from "react-router-dom";

function TankNav() {
  const { tankId } = useParams();

  const styles = {
    nav: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 50px",
      backgroundColor: "#111827", // same dark as AdminNav
      color: "#fff",
      marginBottom: "30px",
    },
    ul: {
      listStyle: "none",
      display: "flex",
      gap: "30px",
      margin: 0,
      padding: 0,
    },
    link: {
      color: "#fff",
      textDecoration: "none",
      fontWeight: "500",
      fontSize: "16px",
    },
    linkHover: {
      textDecoration: "underline",
    },
  };

  return (
    <nav style={styles.nav}>
      <ul style={styles.ul}>
        <li>
          <Link to={`/tank/${tankId}/dashboard`} style={styles.link}>
            Tank Dashboard
          </Link>
        </li>
        <li>
          <Link to={`/tank/${tankId}/water-quality`} style={styles.link}>
            Water Quality
          </Link>
        </li>
        <li>
          <Link to={`/tank/${tankId}/tank-level`} style={styles.link}>
            Tank Level
          </Link>
        </li>
        <li>
          <Link to={`/admin/issues/${tankId}`} style={styles.link}>
            Issue Reports
          </Link>
        </li>
        <li>
          <Link to={`/tank/${tankId}/billing`} style={styles.link}>
            Billing
          </Link>
        </li>
        <li>
          <Link to={"/sellers"} style={styles.link}>
            Home
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default TankNav;
