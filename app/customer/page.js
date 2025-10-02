'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';

export default function CustomerPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    Name: '',
    dateOfBirth: '',
    interest: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock data for initial display
  const mockCustomers = [
    {
      _id: 'mock1',
      Name: 'NUt',
      dateOfBirth: '1990-05-15T00:00:00.000Z',
      memberNumber: 1,
      interest: 'movies'
    },
    {
      _id: 'mock2',
      Name: 'Oud',
      dateOfBirth: '1985-12-03T00:00:00.000Z',
      memberNumber: 2,
      interest: 'football'
    },
    {
      _id: 'mock3',
      Name: 'INchy',
      dateOfBirth: '1992-08-22T00:00:00.000Z',
      memberNumber: 3,
      interest: 'gym'
    },
    {
      _id: 'mock4',
      Name: 'Krit',
      dateOfBirth: '1988-03-10T00:00:00.000Z',
      memberNumber: 4,
      interest: 'gaming'
    },
    {
      _id: 'mock5',
      Name: 'Aum',
      dateOfBirth: '1995-11-18T00:00:00.000Z',
      memberNumber: 5,
      interest: 'movies'
    }
  ];

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customer');
      const data = await response.json();
      
      // If no customers exist, show mock data
      if (data.length === 0) {
        setCustomers(mockCustomers);
      } else {
        setCustomers(data);
      }
    } catch (error) {
      // If API fails, show mock data
      setCustomers(mockCustomers);
      setError('Using mock data - API connection failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // If editing mock data, update local state
    if (editingCustomer && editingCustomer._id.startsWith('mock')) {
      const updatedCustomers = customers.map(customer => 
        customer._id === editingCustomer._id 
          ? { ...customer, ...formData, dateOfBirth: new Date(formData.dateOfBirth).toISOString() }
          : customer
      );
      setCustomers(updatedCustomers);
      setSuccess('Customer updated successfully!');
      setOpen(false);
      setEditingCustomer(null);
      setFormData({ Name: '', dateOfBirth: '', interest: '' });
      return;
    }

    try {
      const url = editingCustomer ? `/api/customer/${editingCustomer._id}` : '/api/customer';
      const method = editingCustomer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(editingCustomer ? 'Customer updated successfully!' : 'Customer created successfully!');
        setOpen(false);
        setEditingCustomer(null);
        setFormData({ Name: '', dateOfBirth: '', interest: '' });
        fetchCustomers();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Operation failed');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  // Handle delete
  const handleDelete = async (memberNumber) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    // If it's mock data, just remove from local state
    const customerToDelete = customers.find(c => c.memberNumber === memberNumber);
    if (customerToDelete && customerToDelete._id.startsWith('mock')) {
      setCustomers(customers.filter(customer => customer.memberNumber !== memberNumber));
      setSuccess('Customer deleted successfully!');
      return;
    }

    try {
      // Find the customer by member number to get the actual _id for API call
      const customer = customers.find(c => c.memberNumber === memberNumber);
      if (customer) {
        const response = await fetch(`/api/customer/${customer._id}`, { method: 'DELETE' });
        if (response.ok) {
          setSuccess('Customer deleted successfully!');
          fetchCustomers();
        } else {
          setError('Failed to delete customer');
        }
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  // Handle edit
  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      Name: customer.Name,
      dateOfBirth: customer.dateOfBirth.split('T')[0], // Format for date input
      interest: customer.interest
    });
    setOpen(true);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingCustomer(null);
    setFormData({ Name: '', dateOfBirth: '', interest: '' });
    setOpen(true);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Box className="p-6">
      <Box className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-violet-950">Customer Management</h1>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNew}
          className="bg-violet-600 hover:bg-violet-700"
        >
          Add New Customer
        </Button>
      </Box>

      {error && <Alert severity="error" className="mb-4">{error}</Alert>}
      {success && <Alert severity="success" className="mb-4">{success}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Member #</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Interest</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer._id}>
                <TableCell>{customer.memberNumber}</TableCell>
                <TableCell>{customer.Name}</TableCell>
                <TableCell>{new Date(customer.dateOfBirth).toLocaleDateString()}</TableCell>
                <TableCell>{customer.interest}</TableCell>
                <TableCell>
                  <Link href={`/customer/${customer.memberNumber}`}>
                    <IconButton size="small" color="primary">
                      <Visibility />
                    </IconButton>
                  </Link>
                  <IconButton size="small" color="secondary" onClick={() => handleEdit(customer)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(customer.memberNumber)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Name"
              fullWidth
              variant="outlined"
              value={formData.Name}
              onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
              required
              error={false}
              helperText=""
            />
            <TextField
              margin="dense"
              label="Date of Birth"
              type="date"
              fullWidth
              variant="outlined"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
              error={false}
              helperText=""
            />
            <TextField
              margin="dense"
              label="Interest"
              fullWidth
              variant="outlined"
              value={formData.interest}
              onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
              required
              error={false}
              helperText=""
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
