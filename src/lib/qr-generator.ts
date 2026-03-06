import QRCode from "qrcode";
import sharp from "sharp";
import { Buffer } from "buffer";

// --- Interfaces ---

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
  logo?: string | null; // URL to logo/profile image
}

export interface CardTemplate {
  width: number;
  height: number;
  textColor: string;
  accentColor: string;
  fontFamily: string;
}

// --- SVG Icons (White versions for dark theme) ---
const ICONS = {
  location:
    '<path fill="#94a3b8" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
  phone:
    '<path fill="#94a3b8" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>',
  email:
    '<path fill="#94a3b8" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
  website:
    '<path fill="#94a3b8" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>',
  linkedin:
    '<path fill="#94a3b8" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>',
  twitter:
    '<path fill="#94a3b8" d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>',
  facebook:
    '<path fill="#94a3b8" d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>',
  instagram:
    '<path fill="#94a3b8" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>',
};

// --- Helper Functions ---

async function generateQRCode(
  data: string,
  size: number = 150,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    QRCode.toBuffer(
      data,
      {
        width: size,
        margin: 1,
        color: {
          dark: "#0f172a", // Dark Slate for the QR code itself
          light: "#ffffff", // White background
        },
        errorCorrectionLevel: "M",
      },
      (err, buffer) => {
        if (err) reject(new Error("Failed to generate QR code"));
        else resolve(buffer);
      },
    );
  });
}

async function getProcessedLogo(
  url: string,
  size: number,
): Promise<Buffer | null> {
  try {
    if (!url || !url.startsWith("http")) return null;

    const response = await fetch(url, {
      headers: { "User-Agent": "DigiSense/1.0" },
    });
    if (!response.ok) return null;

    const arrayBuffer = await response.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const resized = await sharp(inputBuffer)
      .resize(size, size, { fit: "cover" })
      .toBuffer();

    // Circular Mask with White Border for dark theme
    const borderSize = size + 8;
    const circleSvg = `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="black"/></svg>`;
    const borderSvg = `<svg width="${borderSize}" height="${borderSize}"><circle cx="${borderSize / 2}" cy="${borderSize / 2}" r="${borderSize / 2 - 2}" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/></svg>`;

    const maskedImage = await sharp(resized)
      .composite([{ input: Buffer.from(circleSvg), blend: "dest-in" }])
      .png()
      .toBuffer();

    return await sharp({
      create: {
        width: borderSize,
        height: borderSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      },
    })
      .composite([
        { input: Buffer.from(borderSvg), top: 0, left: 0 },
        { input: maskedImage, top: 4, left: 4 },
      ])
      .png()
      .toBuffer();
  } catch (error) {
    console.error("Logo processing failed:", error);
    return null;
  }
}

/**
 * Generates a premium dark-themed business card with rounded borders.
 */
export async function generateBusinessCard(
  professional: ProfessionalData,
  template: CardTemplate = {
    width: 1050,
    height: 600,
    textColor: "#f1f5f9", // Slate 100
    accentColor: "#38bdf8", // Sky 400
    fontFamily: "Arial, Helvetica, sans-serif",
  },
): Promise<Buffer> {
  try {
    const { width, height, textColor, accentColor } = template;
    const borderRadius = 20; // Rounded corners radius
    const padding = 60;
    const logoSize = 120;

    // 1. Generate Data
    const profileData = JSON.stringify({
      name: professional.name,
      title: professional.professionalHeadline,
      phone: professional.phone,
      email: professional.email,
      website: professional.website,
    });

    // 2. Generate Assets
    const [qrCodeBuffer, logoBuffer] = await Promise.all([
      generateQRCode(profileData, 160),
      professional.logo
        ? getProcessedLogo(professional.logo, logoSize)
        : Promise.resolve(null),
    ]);

    // 3. Create SVG Overlay (Text and Shapes)
    // This SVG acts as the main design layer on top of a dark background
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <!-- Dark Slate Gradient Background -->
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" /> <!-- Slate 900 -->
              <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" /> <!-- Slate 800 -->
            </linearGradient>
            
            <!-- Border Gradient for extra gloss -->
            <linearGradient id="borderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#38bdf8;stop-opacity:0.5" />
              <stop offset="50%" style="stop-color:#ffffff;stop-opacity:0.1" />
              <stop offset="100%" style="stop-color:#38bdf8;stop-opacity:0.5" />
            </linearGradient>

            <!-- Glass Effect Filter -->
            <filter id="glass" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
              <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.3 0"/>
            </filter>
        </defs>

        <!-- 1. Background Shape (Rounded Rect) -->
        <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${borderRadius}" ry="${borderRadius}" fill="url(#bgGradient)" />
        
        <!-- 2. Decorative Elements -->
        <!-- Abstract glowing circle top right -->
        <circle cx="${width - 50}" cy="-50" r="300" fill="#38bdf8" opacity="0.05" />
        <circle cx="100" cy="${height + 50}" r="250" fill="#38bdf8" opacity="0.03" />
        
        <!-- 3. Border Stroke -->
        <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${borderRadius}" ry="${borderRadius}" fill="none" stroke="url(#borderGradient)" stroke-width="2" />

        <!-- 4. Header Section (Top Left) -->
        <g transform="translate(${padding}, ${padding})">
           <!-- Placeholder for Logo positioning handled in Sharp composite, but we draw a ring here if no logo -->
           ${
             !logoBuffer
               ? `
             <circle cx="${logoSize / 2}" cy="${logoSize / 2}" r="${logoSize / 2}" fill="rgba(255,255,255,0.05)" stroke="${accentColor}" stroke-width="2"/>
             <text x="${logoSize / 2}" y="${logoSize / 2 + 15}" font-family="${template.fontFamily}" font-size="40" fill="white" text-anchor="middle">${professional.name.charAt(0)}</text>
           `
               : ""
           }

           <!-- Name & Headline -->
           <g transform="translate(${logoBuffer ? logoSize + 25 : 0}, ${logoBuffer ? 0 : 150})">
              <text x="0" y="35" font-family="${template.fontFamily}" font-size="42" font-weight="bold" fill="white" letter-spacing="-1">
                ${professional.name}
              </text>
              ${
                professional.professionalHeadline
                  ? `
                <rect x="0" y="50" width="100" height="2" fill="${accentColor}" opacity="0.5" rx="1" />
                <text x="0" y="80" font-family="${template.fontFamily}" font-size="18" fill="#94a3b8" font-style="italic">
                  ${professional.professionalHeadline}
                </text>
              `
                  : ""
              }
           </g>
        </g>

        <!-- 5. Main Content (Contact Info) -->
        <g transform="translate(${padding}, ${height / 2 + 20})">
           <text x="0" y="0" font-family="${template.fontFamily}" font-size="12" fill="${accentColor}" font-weight="bold" letter-spacing="1">CONTACT</text>
           
           ${
             professional.phone
               ? `
             <g transform="translate(0, 35)">
               <svg width="20" height="20" viewBox="0 0 24 24">${ICONS.phone}</svg>
               <text x="30" y="16" font-family="${template.fontFamily}" font-size="15" fill="#cbd5e1">${professional.phone}</text>
             </g>
           `
               : ""
           }

           ${
             professional.email
               ? `
             <g transform="translate(0, 70)">
               <svg width="20" height="20" viewBox="0 0 24 24">${ICONS.email}</svg>
               <text x="30" y="16" font-family="${template.fontFamily}" font-size="15" fill="#cbd5e1">${professional.email}</text>
             </g>
           `
               : ""
           }

           ${
             professional.website
               ? `
             <g transform="translate(0, 105)">
               <svg width="20" height="20" viewBox="0 0 24 24">${ICONS.website}</svg>
               <text x="30" y="16" font-family="${template.fontFamily}" font-size="15" fill="#cbd5e1">${professional.website}</text>
             </g>
           `
               : ""
           }

           ${
             professional.location
               ? `
             <g transform="translate(0, 140)">
               <svg width="20" height="20" viewBox="0 0 24 24">${ICONS.location}</svg>
               <text x="30" y="16" font-family="${template.fontFamily}" font-size="15" fill="#cbd5e1">${professional.location}</text>
             </g>
           `
               : ""
           }
        </g>

        <!-- 6. Social Media (Bottom Left) -->
         <g transform="translate(${padding}, ${height - padding - 10})">
           ${professional.linkedin ? `<svg x="0" width="20" height="20" viewBox="0 0 24 24">${ICONS.linkedin}</svg>` : ""}
           ${professional.twitter ? `<svg x="30" width="20" height="20" viewBox="0 0 24 24">${ICONS.twitter}</svg>` : ""}
           ${professional.facebook ? `<svg x="60" width="20" height="20" viewBox="0 0 24 24">${ICONS.facebook}</svg>` : ""}
           ${professional.instagram ? `<svg x="90" width="20" height="20" viewBox="0 0 24 24">${ICONS.instagram}</svg>` : ""}
         </g>

        <!-- 7. QR Code Container (Glassmorphism style on right) -->
        <g transform="translate(${width - 230}, ${height - 250})">
           <!-- Glass Background -->
           <rect x="0" y="0" width="180" height="210" rx="12" ry="12" fill="white" opacity="0.95" />
           <!-- Accent Bar on top of container -->
           <rect x="0" y="0" width="180" height="6" rx="12" ry="12" fill="${accentColor}" />
           <text x="90" y="200" font-family="${template.fontFamily}" font-size="10" fill="#64748b" text-anchor="middle" font-weight="bold">SCAN TO CONNECT</text>
        </g>

      </svg>
    `;

    // 4. Composite Layers
    const layers: sharp.OverlayOptions[] = [
      { input: Buffer.from(svgContent), top: 0, left: 0 },
    ];

    // Add Logo if exists (Precise positioning)
    if (logoBuffer) {
      layers.push({
        input: logoBuffer,
        top: padding - 4, // Adjust alignment with name
        left: padding,
      });
    }

    // Add QR Code (Inside the white container defined in SVG)
    layers.push({
      input: qrCodeBuffer,
      top: height - 250 + 20, // Offset to fit inside the glass container
      left: width - 230 + 10,
    });

    // Create final image with transparency support
    const finalCard = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background for the rounded corners
      },
    })
      .composite(layers)
      .png()
      .toBuffer();

    return finalCard;
  } catch (error) {
    console.error("Error generating business card:", error);
    throw new Error("Failed to generate business card");
  }
}

/**
 * Legacy wrapper
 */
export async function generateVisitingCard(
  professional: ProfessionalData,
  template?: CardTemplate,
): Promise<Buffer> {
  return generateBusinessCard(professional, template);
}
