import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material';

function UpdateUser() {
    const [inputs, setInputs] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchHandler = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // Check if token exists
                if (!token) {
                    setError('No authentication token found. Please login again.');
                    navigate('/login'); // Redirect to login if no token
                    return;
                }

                const response = await axios.get(`http://localhost:5000/users/${id}`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                setInputs(response.data.user);
            } catch (error) {
                console.error('Error fetching user:', error);
                if (error.response?.status === 401) {
                    setError('Authentication failed. Please login again.');
                    localStorage.removeItem('token'); // Remove invalid token
                    navigate('/login');
                } else {
                    setError('Failed to load user data. Please try again.');
                }
            }
        };
        
        if (id) {
            fetchHandler();
        }
    }, [id, navigate]);

    const sendRequest = async () => {
        const token = localStorage.getItem('token');
        
        // Check if token exists
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await axios.put(`http://localhost:5000/users/${id}`, {
            name: String(inputs.name),
            gmail: String(inputs.gmail),
            number: String(inputs.number || ''),
            age: Number(inputs.age),
            address: String(inputs.address),
        }, { 
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            } 
        });
        
        return response.data;
    };

    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Updating user with data:', inputs);
            await sendRequest();
            navigate('/userdetails'); // Navigate on success
        } catch (error) {
            console.error('Error updating user:', error);
            
            if (error.response?.status === 401) {
                setError('Authentication failed. Please login again.');
                localStorage.removeItem('token');
                navigate('/login');
            } else if (error.response?.status === 403) {
                setError('You do not have permission to update this user.');
            } else if (error.response?.status === 404) {
                setError('User not found.');
            } else {
                setError(error.response?.data?.message || 'Failed to update user. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Container maxWidth="sm">
                <Box sx={{ mt: 4, display: 'grid', gap: 2 }}>
                    <Typography variant="h5">Update User</Typography>
                    
                    {error && (
                        <Alert severity="error" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'grid', gap: 2 }}>
                            <TextField 
                                label="Name" 
                                name="name" 
                                value={inputs.name || ''} 
                                onChange={handleChange} 
                                size="small" 
                                required 
                                disabled={loading}
                            />
                            <TextField 
                                label="Gmail" 
                                name="gmail" 
                                type="email" 
                                value={inputs.gmail || ''} 
                                onChange={handleChange} 
                                size="small" 
                                required 
                                disabled={loading}
                            />
                            <TextField 
                                label="Number" 
                                name="number" 
                                value={inputs.number || ''} 
                                onChange={handleChange} 
                                size="small" 
                                disabled={loading}
                            />
                            <TextField 
                                label="Age" 
                                name="age" 
                                type="number" 
                                value={inputs.age || ''} 
                                onChange={handleChange} 
                                size="small" 
                                required 
                                disabled={loading}
                            />
                            <TextField 
                                label="Address" 
                                name="address" 
                                value={inputs.address || ''} 
                                onChange={handleChange} 
                                size="small" 
                                multiline 
                                rows={3} 
                                required 
                                disabled={loading}
                            />
                            <Button 
                                type="submit" 
                                variant="contained" 
                                disabled={loading}
                            >
                                {loading ? 'Updating...' : 'Update User'}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </Container>
        </div>
    );
}

export default UpdateUser;