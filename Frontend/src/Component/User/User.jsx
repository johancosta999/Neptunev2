import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function User({ user }) {
  const { _id, name, gmail, age, address, number, role, password } = user;
  const navigate = useNavigate();

  const deleteHandler = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/users/${_id}`, { headers: { Authorization: `Bearer ${token}` } });
      alert("User deleted successfully");

     
      navigate(`/userdetails?deleted=${Date.now()}`);
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user.");
    }
  };

  return (
    <div>
      <h3>ID: { _id }</h3>
      <h3>Name: { name }</h3>
      <h3>Gmail: { gmail }</h3>
      <h3>Number: { number || '-' }</h3>
      <h3>Role: { role || '-' }</h3>
      <h3>Age: { age ?? '-' }</h3>
      <h3>Address: { address || '-' }</h3>
      <h3>Password: { password ? '•'.repeat(8) : '-' }</h3>
      <div className="actions">
        <Link className="btn" to={`/userdetails/${_id}`}>Update</Link>
        <button className="btn" onClick={deleteHandler}>Delete</button>
      </div>
    </div>
  );
}

export default User;