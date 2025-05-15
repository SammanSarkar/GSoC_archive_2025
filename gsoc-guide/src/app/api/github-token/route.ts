import { NextResponse } from 'next/server';

export async function GET() {
  // Note: This is just for debugging - would never expose token in a real API
  const token = process.env.GITHUB_TOKEN || 'not-found';
  const allEnvVars = Object.keys(process.env).filter(key => !key.includes('SECRET'));
  
  return NextResponse.json({
    tokenAvailable: !!process.env.GITHUB_TOKEN,
    tokenFirstChars: token.substring(0, 3) + '...',
    envVarsAvailable: allEnvVars
  });
} 