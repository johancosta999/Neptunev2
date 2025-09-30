import React, { useState } from 'react';
// import Nav from '../Nav/Nav';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Box, TextField, Button, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

function AddUser() {
  const history = useNavigate();
  const [inputs,setInputs] = useState({
      name:"",
      gmail:"",
      number:"",
      age:"",
      address:"",
      role:"admin", // default to admin
      password:"",
  });
  const handleChange = (e) =>{
    setInputs((prevState) =>({
      ...prevState,
      [e.target.name] : e.target.value,
    }));
  };

  const handleSubmit =(e) =>{
    e.preventDefault();
    console.log(inputs);
    sendRequest().then(() => history('/userdetails'))
  };

  const sendRequest = async()=>{
    const token = localStorage.getItem('token');
    await axios.post("http://localhost:5000/users",{
      name: String(inputs.name),
      gmail: String(inputs.gmail),
      number: String(inputs.number),
      age: Number(inputs.age),
      address: String(inputs.address),
      role: String(inputs.role), // backend defaults to admin, but we send selected role
      password: inputs.password ? String(inputs.password) : undefined,
    }, { headers: { Authorization: `Bearer ${token}` } })
  }

  return (
    <div>
      {/* <Nav/> */}
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, display: 'grid', gap: 2 }}>
          <Typography variant="h5">Add User Page</Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField label="Name" name="name" value={inputs.name} onChange={handleChange} size="small" required />
              <TextField label="Gmail" name="gmail" type="email" value={inputs.gmail} onChange={handleChange} size="small" required />
              <TextField label="Number" name="number" value={inputs.number} onChange={handleChange} size="small" />
              <TextField label="Age" name="age" type="number" value={inputs.age} onChange={handleChange} size="small" required />
              <TextField label="Address" name="address" value={inputs.address} onChange={handleChange} size="small" multiline rows={3} required />
              <TextField label="Password" name="password" type="password" value={inputs.password} onChange={handleChange} size="small" required />
              <FormControl size="small">
                <InputLabel id="role-label">Role</InputLabel>
                <Select labelId="role-label" label="Role" name="role" value={inputs.role} onChange={handleChange}>
                  <MenuItem value="admin">admin</MenuItem>
                  <MenuItem value="user">user</MenuItem>
                </Select>
              </FormControl>
              <Button type="submit" variant="contained">Submit</Button>
            </Box>
          </form>
        </Box>
      </Container>
    </div>
  )
}

export default AddUser