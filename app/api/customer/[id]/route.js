import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';

// GET - Get single customer by member number or ID
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    // Try to parse as member number first
    const memberNumber = parseInt(params.id);
    let customer;
    
    if (!isNaN(memberNumber)) {
      // Look up by member number
      customer = await Customer.findOne({ memberNumber: memberNumber });
    } else {
      // Fallback to MongoDB ID lookup
      customer = await Customer.findById(params.id);
    }
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

// PUT - Update customer by member number or ID
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Try to parse as member number first
    const memberNumber = parseInt(params.id);
    let customer;
    
    if (!isNaN(memberNumber)) {
      // Look up by member number
      customer = await Customer.findOneAndUpdate(
        { memberNumber: memberNumber }, 
        body, 
        { new: true }
      );
    } else {
      // Fallback to MongoDB ID lookup
      customer = await Customer.findByIdAndUpdate(params.id, body, { new: true });
    }
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Member number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

// DELETE - Delete customer by member number or ID
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    // Try to parse as member number first
    const memberNumber = parseInt(params.id);
    let customer;
    
    if (!isNaN(memberNumber)) {
      // Look up by member number
      customer = await Customer.findOneAndDelete({ memberNumber: memberNumber });
    } else {
      // Fallback to MongoDB ID lookup
      customer = await Customer.findByIdAndDelete(params.id);
    }
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
