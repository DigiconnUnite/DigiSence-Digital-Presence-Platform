import { NextRequest, NextResponse } from 'next/server';
import { generateBusinessCard, ProfessionalData } from '@/lib/qr-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { professional } = body;

    if (!professional) {
      return NextResponse.json(
        { error: 'Professional data is required' },
        { status: 400 }
      );
    }

    // Extract professional data
    const professionalData: ProfessionalData = {
      name: professional.name,
      professionalHeadline: professional.professionalHeadline,
      location: professional.location,
      phone: professional.phone,
      email: professional.email,
      website: professional.website,
      facebook: professional.facebook,
      twitter: professional.twitter,
      instagram: professional.instagram,
      linkedin: professional.linkedin,
    };

    // Generate the business card
    const cardBuffer = await generateBusinessCard(professionalData);

    // Convert buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(cardBuffer);

    // Return the PNG buffer
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${professional.name.replace(/\s+/g, '_')}_Visiting_Card.png"`,
      },
    });
  } catch (error) {
    console.error('Error generating visiting card:', error);
    return NextResponse.json(
      { error: 'Failed to generate visiting card' },
      { status: 500 }
    );
  }
}