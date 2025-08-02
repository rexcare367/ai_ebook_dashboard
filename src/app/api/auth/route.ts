import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClerkClient } from '@clerk/backend';

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.email || !body.username) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email and username are required'
        },
        { status: 422 }
      );
    }

    const user = await clerk.users.createUser({
      emailAddress: [body.email],
      username: body.username,
      password: 'Ebook123$%^'
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error: any) {
    // Handle Clerk API specific errors
    if (error.errors && error.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0].message
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to create user'
      },
      { status: 500 }
    );
  }
}
