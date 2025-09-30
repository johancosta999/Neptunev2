import React from "react";

const PrintWaterQuality = React.forwardRef(({ records }, ref) => (
  <div ref={ref}>
    <h2>Printable Water Quality Report</h2>
    <table border="1" cellPadding="10">
      <thead>
        <tr>
          <th>ID</th>
          <th>PH Level</th>
          <th>TDS</th>
          <th>Status</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {records.map((rec) => (
          <tr key={rec._id}>
            <td>{rec._id}</td>
            <td>{rec.phLevel}</td>
            <td>{rec.tds}</td>
            <td>{rec.status}</td>
            <td>{rec.timestamp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

export default PrintWaterQuality;
