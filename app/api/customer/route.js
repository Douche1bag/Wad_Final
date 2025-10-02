import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';

// GET - List all customers
export async function GET() {
  try {
    await dbConnect();
    const customers = await Customer.find({}).sort({ memberNumber: 1 });
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// POST - Create new customer
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Auto-generate member number (fill gaps in sequence)
    const customers = await Customer.find({}).sort({ memberNumber: 1 });
    let nextMemberNumber = 1;
    
    // Find the first gap in the sequence
    for (const customer of customers) {
      if (customer.memberNumber === nextMemberNumber) {
        nextMemberNumber++;
      } else if (customer.memberNumber > nextMemberNumber) {
        // Found a gap, use this number
        break;
      }
    }
    
    const customerData = {
      ...body,
      memberNumber: nextMemberNumber
    };
    
    const customer = new Customer(customerData);
    await customer.save();
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Member number already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
