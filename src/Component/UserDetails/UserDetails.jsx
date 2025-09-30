import React, { useEffect, useRef, useState } from 'react';
// import Nav from '../Nav/Nav';
import axios from 'axios';
import User from '../User/User';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const URL = "http://localhost:5000/users";

const fetchHandler = async () => {
  const token = localStorage.getItem("token"); // ✅ get JWT from localStorage
  if (!token) {
    throw new Error("No token found. Please login first.");
  }

  return await axios
    .get(URL, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ attach token in header
      },
    })
    .then((res) => res.data);
};

function UserDetails() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const componentRef = useRef();

  useEffect(() => {
    fetchHandler()
      .then((data) => setUsers(data.users))
      .catch((err) => {
        console.error("Fetch error:", err);
        setError("Unauthorized. Please login again.");
      });
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.gmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadPdf = () => {
    const input = componentRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Users_Report.pdf');
    });
  };

  const handleSendReport = () => {
    const phoneNumber = "+94711042020";
    const message = `Selected User Reports`;
    const whatsAppurl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsAppurl, "_blank");
  };

  return (
    <div>
      {/* <Nav /> */}
      <h1>User Details Display Page</h1>

      {/* Show error if unauthorized */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          padding: '10px',
          marginBottom: '20px',
          width: '300px',
          fontSize: '16px',
        }}
      />

      <div
        ref={componentRef}
        style={{ padding: '10px', backgroundColor: 'white' }}
      >
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user._id}>
              <User user={user} />
            </div>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>

      <button onClick={handleDownloadPdf} style={{ marginTop: '20px' }}>
        Download PDF
      </button>
      <br />
      <button onClick={handleSendReport}>Send WhatsApp message</button>
    </div>
  );
}

export default UserDetails;