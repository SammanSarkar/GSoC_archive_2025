import { NextResponse } from 'next/server';
import { getAllOrganizationsWithProposals } from '@/utils/proposals';

export async function GET() {
  try {
    const proposalsMap = getAllOrganizationsWithProposals();
    return NextResponse.json(proposalsMap);
  } catch (error) {
    console.error('Error fetching proposals data:', error);
    return NextResponse.json({ error: 'Failed to fetch proposals data' }, { status: 500 });
  }
} 