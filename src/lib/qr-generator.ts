import QRCode from 'qrcode';
import sharp from 'sharp';

export interface ProfessionalData {
  name: string;
  professionalHeadline?: string | null;
  location?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
}

export interface CardTemplate {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontFamily: string;
}

/**
 * Generates a QR code as a Buffer
 */
export async function generateQRCode(data: string, size: number = 200): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      QRCode.toBuffer(data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      }, (err, buffer) => {
        if (err) {
          console.error('Error generating QR code:', err);
          reject(new Error('Failed to generate QR code'));
        } else {
          resolve(buffer);
        }
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      reject(new Error('Failed to generate QR code'));
    }
  });
}

/**
 * Creates a professional visiting card PNG with QR code
 */
export async function generateVisitingCard(
  professional: ProfessionalData,
  template: CardTemplate = {
    width: 800,
    height: 480,
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#007bff',
    fontFamily: 'Arial'
  }
): Promise<Buffer> {
  try {
    const { width, height, backgroundColor, textColor, accentColor } = template;

    // Create base card background
    const card = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: backgroundColor
      }
    });

    // Generate QR code for professional's profile URL or contact info
    const profileData = JSON.stringify({
      name: professional.name,
      title: professional.professionalHeadline,
      phone: professional.phone,
      email: professional.email,
      website: professional.website,
      location: professional.location
    });

    const qrCodeBuffer = await generateQRCode(profileData, 180);

    // Create the card layout
    const cardBuffer = await card
      .composite([
        // QR Code
        {
          input: qrCodeBuffer,
          left: width - 200,
          top: 40
        },
        // Profile picture placeholder (circular)
        {
          input: {
            create: {
              width: 120,
              height: 120,
              channels: 4,
              background: accentColor
            }
          },
          left: 40,
          top: 40
        }
      ])
      .png()
      .toBuffer();

    // Create SVG overlay for text content
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Profile picture border -->
        <circle cx="100" cy="100" r="60" fill="none" stroke="${textColor}" stroke-width="2"/>
        
        <!-- Name -->
        <text x="180" y="80" font-family="${template.fontFamily}" font-size="32" font-weight="bold" fill="${textColor}">
          ${professional.name}
        </text>
        
        <!-- Professional Headline -->
        ${professional.professionalHeadline ? `
          <text x="180" y="110" font-family="${template.fontFamily}" font-size="16" fill="${accentColor}">
            ${professional.professionalHeadline}
          </text>
        ` : ''}
        
        <!-- Contact Information -->
        <g font-family="${template.fontFamily}" font-size="14" fill="${textColor}">
          ${professional.location ? `
            <text x="40" y="200">📍 ${professional.location}</text>
          ` : ''}
          
          ${professional.phone ? `
            <text x="40" y="230">📞 ${professional.phone}</text>
          ` : ''}
          
          ${professional.email ? `
            <text x="40" y="260">✉️ ${professional.email}</text>
          ` : ''}
          
          ${professional.website ? `
            <text x="40" y="290">🌐 ${professional.website}</text>
          ` : ''}
        </g>
        
        <!-- Social Media Icons -->
        <g font-family="${template.fontFamily}" font-size="12" fill="${textColor}">
          ${professional.facebook ? `<text x="40" y="340">Facebook: ${professional.facebook}</text>` : ''}
          ${professional.linkedin ? `<text x="40" y="360">LinkedIn: ${professional.linkedin}</text>` : ''}
          ${professional.twitter ? `<text x="40" y="380">Twitter: ${professional.twitter}</text>` : ''}
          ${professional.instagram ? `<text x="40" y="400">Instagram: ${professional.instagram}</text>` : ''}
        </g>
        
        <!-- Footer -->
        <rect x="0" y="${height - 40}" width="${width}" height="40" fill="${accentColor}"/>
        <text x="${width / 2}" y="${height - 15}" font-family="${template.fontFamily}" font-size="12" fill="white" text-anchor="middle">
          Scan QR Code for Digital Contact
        </text>
      </svg>
    `;

    // Composite the SVG text overlay
    const finalCard = await sharp(cardBuffer)
      .composite([
        {
          input: Buffer.from(svgContent),
          left: 0,
          top: 0
        }
      ])
      .png()
      .toBuffer();

    return finalCard;
  } catch (error) {
    console.error('Error generating visiting card:', error);
    throw new Error('Failed to generate visiting card');
  }
}

/**
 * Generates a business card with a more formal layout
 */
export async function generateBusinessCard(
  professional: ProfessionalData,
  template: CardTemplate = {
    width: 900,
    height: 540,
    backgroundColor: '#ffffff',
    textColor: '#333333',
    accentColor: '#007bff',
    fontFamily: 'Arial'
  }
): Promise<Buffer> {
  try {
    const { width, height, backgroundColor, textColor, accentColor } = template;

    // Create base card with subtle gradient
    const card = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: backgroundColor
      }
    });

    // Generate QR code
    const profileData = JSON.stringify({
      name: professional.name,
      title: professional.professionalHeadline,
      phone: professional.phone,
      email: professional.email,
      website: professional.website
    });

    const qrCodeBuffer = await generateQRCode(profileData, 200);

    // Create the business card layout
    const cardBuffer = await card
      .composite([
        // QR Code in bottom right
        {
          input: qrCodeBuffer,
          left: width - 220,
          top: height - 220
        }
      ])
      .png()
      .toBuffer();

    // Create SVG overlay for business card content
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Header background -->
        <rect x="0" y="0" width="${width}" height="120" fill="${accentColor}"/>
        
        <!-- Profile picture placeholder -->
        <circle cx="120" cy="60" r="40" fill="white" stroke="${textColor}" stroke-width="2"/>
        
        <!-- Name and Title -->
        <text x="180" y="50" font-family="${template.fontFamily}" font-size="36" font-weight="bold" fill="white">
          ${professional.name}
        </text>
        
        ${professional.professionalHeadline ? `
          <text x="180" y="85" font-family="${template.fontFamily}" font-size="18" fill="white">
            ${professional.professionalHeadline}
          </text>
        ` : ''}
        
        <!-- Contact section -->
        <g font-family="${template.fontFamily}" font-size="14" fill="${textColor}">
          ${professional.location ? `
            <text x="40" y="180">📍 ${professional.location}</text>
          ` : ''}
          
          ${professional.phone ? `
            <text x="40" y="210">📞 ${professional.phone}</text>
          ` : ''}
          
          ${professional.email ? `
            <text x="40" y="240">✉️ ${professional.email}</text>
          ` : ''}
          
          ${professional.website ? `
            <text x="40" y="270">🌐 ${professional.website}</text>
          ` : ''}
        </g>
        
        <!-- Social media section -->
        <g font-family="${template.fontFamily}" font-size="12" fill="${textColor}">
          ${professional.facebook || professional.linkedin || professional.twitter || professional.instagram ? `
            <text x="40" y="320" font-weight="bold">Connect with me:</text>
          ` : ''}
          
          ${professional.facebook ? `<text x="40" y="345">Facebook: ${professional.facebook}</text>` : ''}
          ${professional.linkedin ? `<text x="40" y="365">LinkedIn: ${professional.linkedin}</text>` : ''}
          ${professional.twitter ? `<text x="40" y="385">Twitter: ${professional.twitter}</text>` : ''}
          ${professional.instagram ? `<text x="40" y="405">Instagram: ${professional.instagram}</text>` : ''}
        </g>
        
        <!-- QR Code label -->
        <text x="${width - 220}" y="${height - 240}" font-family="${template.fontFamily}" font-size="12" fill="${textColor}">
          Scan for Digital Contact
        </text>
        
        <!-- Footer -->
        <rect x="0" y="${height - 30}" width="${width}" height="30" fill="${accentColor}"/>
        <text x="${width / 2}" y="${height - 8}" font-family="${template.fontFamily}" font-size="10" fill="white" text-anchor="middle">
          Professional Profile Card | Generated by DigiSence
        </text>
      </svg>
    `;

    // Composite the SVG text overlay
    const finalCard = await sharp(cardBuffer)
      .composite([
        {
          input: Buffer.from(svgContent),
          left: 0,
          top: 0
        }
      ])
      .png()
      .toBuffer();

    return finalCard;
  } catch (error) {
    console.error('Error generating business card:', error);
    throw new Error('Failed to generate business card');
  }
}