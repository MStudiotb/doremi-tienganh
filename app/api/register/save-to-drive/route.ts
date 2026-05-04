import { NextRequest, NextResponse } from 'next/server';
import { uploadUserDataToDrive } from '@/lib/google-drive';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { name, email, grade, age, gender, avatarUrl, registrationDate } = body;

    // Validate required fields
    if (!name || !email || !grade || !age || !gender || !avatarUrl || !registrationDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upload to Google Drive in background (non-blocking)
    // We don't await this to avoid blocking the registration process
    uploadUserDataToDrive({
      name,
      email,
      grade,
      age,
      gender,
      avatarUrl,
      registrationDate,
    }).then((success) => {
      if (success) {
        console.log(`✅ User data saved to Google Drive: ${name}`);
      } else {
        console.error(`❌ Failed to save user data to Google Drive: ${name}`);
      }
    }).catch((error) => {
      console.error('Error in background upload:', error);
    });

    // Return immediately to not block registration
    return NextResponse.json(
      { 
        success: true, 
        message: 'Registration data queued for Google Drive upload' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in save-to-drive API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
