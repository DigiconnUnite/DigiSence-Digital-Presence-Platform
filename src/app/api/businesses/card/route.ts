import { NextRequest, NextResponse } from 'next/server';
import { generateBusinessCard, ProfessionalData } from '@/lib/qr-generator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { business } = body;

    if (!business) {
      return NextResponse.json(
        { error: 'Business data is required' },
        { status: 400 }
      );
    }

    // Extract business data
    const professionalData: ProfessionalData = {
      name: business.name,
      professionalHeadline: business.category?.name || business.description,
      location: business.address || business.location,
      phone: business.phone,
      email: business.email,
      website: business.website,
      facebook: business.facebook,
      twitter: business.twitter,
      instagram: business.instagram,
      linkedin: business.linkedin,
      logo: business.logo, // Add business logo
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
        'Content-Disposition': `attachment; filename="${business.name.replace(/\s+/g, '_')}_Visiting_Card.png"`,
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
