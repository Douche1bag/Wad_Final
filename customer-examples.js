// Customer Model Examples
// This file demonstrates how to work with the Customer model

import mongoose from "mongoose";
import Customer from "./models/Customer.js";

// Connect to MongoDB (adjust connection string as needed)
mongoose.connect("mongodb://localhost:27017/your-database-name");

// Insert a few documents into the customers collection.
const insertCustomers = async () => {
  try {
    const customers = await Customer.insertMany([
      { 
        model: 'Premium', 
        dateOfBirth: new Date('1990-05-15T00:00:00Z'), 
        memberNumber: 1, 
        interest: 'movies' 
      },
      { 
        model: 'Standard', 
        dateOfBirth: new Date('1985-12-03T00:00:00Z'), 
        memberNumber: 2, 
        interest: 'football' 
      },
      { 
        model: 'Premium', 
        dateOfBirth: new Date('1992-08-22T00:00:00Z'), 
        memberNumber: 3, 
        interest: 'gym' 
      },
      { 
        model: 'Basic', 
        dateOfBirth: new Date('1988-03-10T00:00:00Z'), 
        memberNumber: 4, 
        interest: 'gaming' 
      },
      { 
        model: 'Premium', 
        dateOfBirth: new Date('1995-11-18T00:00:00Z'), 
        memberNumber: 5, 
        interest: 'movies' 
      },
      { 
        model: 'Standard', 
        dateOfBirth: new Date('1987-07-25T00:00:00Z'), 
        memberNumber: 6, 
        interest: 'football' 
      },
      { 
        model: 'Basic', 
        dateOfBirth: new Date('1993-01-12T00:00:00Z'), 
        memberNumber: 7, 
        interest: 'gaming' 
      },
      { 
        model: 'Premium', 
        dateOfBirth: new Date('1991-09-30T00:00:00Z'), 
        memberNumber: 8, 
        interest: 'gym' 
      }
    ]);
    
    console.log(`${customers.length} customers inserted successfully.`);
    return customers;
  } catch (error) {
    console.error('Error inserting customers:', error);
  }
};

// Find customers born in the 1990s
const findCustomersBornIn90s = async () => {
  try {
    const customersIn90s = await Customer.find({
      dateOfBirth: { 
        $gte: new Date('1990-01-01'), 
        $lt: new Date('2000-01-01') 
      }
    }).countDocuments();
    
    console.log(`${customersIn90s} customers were born in the 1990s.`);
    return customersIn90s;
  } catch (error) {
    console.error('Error finding customers:', error);
  }
};

// Find customers with specific interests
const findCustomersByInterest = async (interest) => {
  try {
    const customers = await Customer.find({ interest: interest });
    console.log(`${customers.length} customers are interested in ${interest}.`);
    return customers;
  } catch (error) {
    console.error('Error finding customers by interest:', error);
  }
};

// Aggregation: Group customers by model and count them
const groupCustomersByModel = async () => {
  try {
    const result = await Customer.aggregate([
      {
        $group: {
          _id: '$model',
          totalCustomers: { $sum: 1 },
          averageMemberNumber: { $avg: '$memberNumber' }
        }
      },
      {
        $sort: { totalCustomers: -1 }
      }
    ]);
    
    console.log('Customers grouped by model:');
    result.forEach(group => {
      console.log(`Model: ${group._id}, Count: ${group.totalCustomers}, Avg Member Number: ${group.averageMemberNumber.toFixed(2)}`);
    });
    
    return result;
  } catch (error) {
    console.error('Error grouping customers:', error);
  }
};

// Aggregation: Find most popular interests
const findPopularInterests = async () => {
  try {
    const result = await Customer.aggregate([
      {
        $group: {
          _id: '$interest',
          count: { $sum: 1 },
          memberNumbers: { $push: '$memberNumber' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    console.log('Most popular interests:');
    result.forEach(interest => {
      console.log(`${interest._id}: ${interest.count} customers (Member Numbers: ${interest.memberNumbers.join(', ')})`);
    });
    
    return result;
  } catch (error) {
    console.error('Error finding popular interests:', error);
  }
};

// Main execution function
const runExamples = async () => {
  try {
    console.log('=== Customer Model Examples ===\n');
    
    // Insert sample data
    console.log('1. Inserting sample customers...');
    await insertCustomers();
    console.log('');
    
    // Find customers born in 90s
    console.log('2. Finding customers born in the 1990s...');
    await findCustomersBornIn90s();
    console.log('');
    
    // Find customers by specific interests
    console.log('3. Finding customers by interest...');
    await findCustomersByInterest('movies');
    await findCustomersByInterest('gaming');
    console.log('');
    
    // Group by model
    console.log('4. Grouping customers by model...');
    await groupCustomersByModel();
    console.log('');
    
    // Find popular interests
    console.log('5. Finding most popular interests...');
    await findPopularInterests();
    
  } catch (error) {
    console.error('Error running examples:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
};

// Run the examples
runExamples();
