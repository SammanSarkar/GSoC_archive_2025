import { NextResponse } from 'next/server';
import { getAllOrganizationsWithGitHubProposals } from '@/utils/github';

export async function GET() {
  try {
    const proposalsMap = await getAllOrganizationsWithGitHubProposals();
    return NextResponse.json(proposalsMap);
  } catch (error) {
    console.error('Error fetching proposals data:', error);
    return NextResponse.json({ error: 'Failed to fetch proposals data' }, { status: 500 });
  }
} 