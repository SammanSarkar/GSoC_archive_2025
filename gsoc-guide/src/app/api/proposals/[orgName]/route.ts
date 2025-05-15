import { NextRequest, NextResponse } from 'next/server';
import { getProposalsForGitHubOrganization } from '@/utils/github';

export async function GET(
  request: NextRequest,
  { params }: { params: { orgName: string } }
) {
  try {
    const orgName = decodeURIComponent(params.orgName);
    const proposals = await getProposalsForGitHubOrganization(orgName);
    return NextResponse.json(proposals);
  } catch (error) {
    console.error(`Error fetching proposals for ${params.orgName}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch proposals for ${params.orgName}` },
      { status: 500 }
    );
  }
} 