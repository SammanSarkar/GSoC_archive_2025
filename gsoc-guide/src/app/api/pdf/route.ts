import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const org = searchParams.get('org');
  const file = searchParams.get('file');

  if (!org || !file) {
    return NextResponse.json({ error: 'Missing org or file parameter' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), '..', 'Proposals', org, file);

  try {
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const pdfBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${file}"`,
      },
    });
  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json({ error: 'Error serving PDF' }, { status: 500 });
  }
} 