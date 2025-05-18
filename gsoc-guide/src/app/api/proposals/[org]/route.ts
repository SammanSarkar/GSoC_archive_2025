import { NextRequest, NextResponse } from 'next/server';
import { getProposalsForGitHubOrganization } from '@/utils/github';

export async function GET(
  request: NextRequest,
  { params }: { params: { org: string } }
) {
  try {
    const org = decodeURIComponent(params.org);
    const proposals = await getProposalsForGitHubOrganization(org);
    return NextResponse.json(proposals);
  } catch (error) {
    console.error(`Error fetching proposals for ${params.org}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch proposals for ${params.org}` },
      { status: 500 }
    );
  }
} 