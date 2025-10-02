'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Button, Card, CardContent, Typography, Alert, CircularProgress } from '@mui/material';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        // First try to fetch by member number (if it's a number)
        const memberNumber = parseInt(params.id);
        if (!isNaN(memberNumber)) {
          // Fetch all customers and find by member number
          const response = await fetch('/api/customer');
          if (response.ok) {
            const customers = await response.json();
            const customer = customers.find(c => c.memberNumber === memberNumber);
            if (customer) {
              setCustomer(customer);
            } else {
              setError('Customer not found');
            }
          } else {
            setError('Failed to fetch customer details');
          }
        } else {
          // Fallback to direct ID fetch (for backward compatibility)
          const response = await fetch(`/api/customer/${params.id}`);
          if (response.ok) {
            const data = await response.json();
            setCustomer(data);
          } else {
            setError('Customer not found');
          }
        }
      } catch (error) {
        setError('Failed to fetch customer details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCustomer();
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const response = await fetch(`/api/customer/${customer._id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/customer');
      } else {
        setError('Failed to delete customer');
      }
    } catch (error) {
      setError('Network error occurred');
    }
  };

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-64">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-6">
        <Alert severity="error">{error}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/customer')}
          className="mt-4"
        >
          Back to Customer List
        </Button>
      </Box>
    );
  }

  if (!customer) {
    return (
      <Box className="p-6">
        <Alert severity="warning">Customer not found</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/customer')}
          className="mt-4"
        >
          Back to Customer List
        </Button>
      </Box>
    );
  }

  return (
    <Box className="p-6">
      <Box className="flex justify-between items-center mb-6">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/customer')}
          variant="outlined"
        >
          Back to Customer List
        </Button>
        <Box>
          <Button
            startIcon={<Edit />}
            onClick={() => router.push(`/customer/edit/${customer.memberNumber}`)}
            variant="contained"
            className="mr-2 bg-violet-600 hover:bg-violet-700"
          >
            Edit Customer
          </Button>
          <Button
            startIcon={<Delete />}
            onClick={handleDelete}
            variant="contained"
            color="error"
          >
            Delete Customer
          </Button>
        </Box>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" className="mb-6 text-violet-950">
            Customer Details
          </Typography>
          
          <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Box>
              <Typography variant="h6" className="mb-2 text-gray-600">
                Member Number
              </Typography>
              <Typography variant="body1" className="mb-4">
                {customer.memberNumber}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" className="mb-2 text-gray-600">
                Name
              </Typography>
              <Typography variant="body1" className="mb-4">
                {customer.Name}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" className="mb-2 text-gray-600">
                Date of Birth
              </Typography>
              <Typography variant="body1" className="mb-4">
                {new Date(customer.dateOfBirth).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" className="mb-2 text-gray-600">
                Interest
              </Typography>
              <Typography variant="body1" className="mb-4">
                {customer.interest}
              </Typography>
            </Box>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}
