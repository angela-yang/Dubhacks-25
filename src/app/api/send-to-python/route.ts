// app/api/send-to-python/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;

    const pythonFormData = new FormData();
    pythonFormData.append('image', image, 'canvas.png');
    pythonFormData.append('prompt', prompt);

    const pythonBackendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL || 'http://localhost:8000';
    const pythonResponse = await fetch(`${pythonBackendUrl}/process`, {
      method: 'POST',
      body: pythonFormData,
    });

    if (!pythonResponse.ok) {
      throw new Error(`Python backend error: ${pythonResponse.status}`);
    }

    const result = await pythonResponse.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}