// TankDisplay.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import AdminNav from "../Nav/adminNav";

function TankDisplay() {
  const navigate = useNavigate();

  // dummy tanks
  const tanks = [
    {
      tankId: "tank001",
      name: "Main Road Tank",
      location: "Colombo",
      capacity: "2000L",
    },
    {
      tankId: "tank002",
      name: "Hill Side Tank",
      location: "Kandy",
      capacity: "1500L",
    },
  ];

  return (
    <div>
      <AdminNav />

      <h1 style={{ color: "blue" }}>Available Tanks</h1>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Tank ID</th>
            <th>Name</th>
            <th>Location</th>
            <th>Capacity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tanks.map((tank, i) => (
            <tr key={i}>
              <td>{tank.tankId}</td>
              <td>{tank.name}</td>
              <td>{tank.location}</td>
              <td>{tank.capacity}</td>
              <td>
                <Link to={`/tank/${tank.tankId}/dashboard`}>
                  <button>Select</button>
                </Link>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TankDisplay;
