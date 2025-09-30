import React from "react";

const PrintWaterLevel = React.forwardRef(({ records }, ref) => (
  <div ref={ref}>
    <h2>Printable Water Level Report</h2>
    <table border="1" cellPadding="10">
      <thead>
        <tr>
          <th>Tank ID</th>
          <th>Location</th>
          <th>Water Level (%)</th>
          <th>Status</th>
          <th>Recorded At</th>
        </tr>
      </thead>
      <tbody>
        {records.map((rec) => (
          <tr key={rec._id}>
            <td>{rec.tankId}</td>
            <td>{rec.location}</td>
            <td>{rec.waterLevel}%</td>
            <td>{rec.status}</td>
            <td>{new Date(rec.recordedAt || rec.timestamp).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

export default PrintWaterLevel;
