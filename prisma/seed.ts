import { db } from '../src/lib/db'
import { hashPassword } from '../src/lib/auth'
import { UserRole, InquiryStatus } from '@prisma/client'

async function main() {
  console.log('Seeding database...')

  // Create Super Admin
  const superAdminPassword = await hashPassword('admin123')
  const superAdmin = await db.user.upsert({
    where: { email: 'admin@bdpp.com' },
    update: {},
    create: {
      email: 'admin@bdpp.com',
      name: 'Super Admin',
      password: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
    },
  })

  console.log('Created Super Admin:', superAdmin.email)

  // Create Categories
  const hospitalityCategory = await db.category.create({
    data: {
      name: 'Hospitality',
      slug: 'hospitality',
      description: 'Restaurants, hotels, and food services',
    },
  })

  const restaurantCategory = await db.category.create({
    data: {
      name: 'Restaurants',
      slug: 'restaurants',
      description: 'Dining establishments',
      parentId: hospitalityCategory.id,
    },
  })

  const techCategory = await db.category.create({
    data: {
      name: 'Technology',
      slug: 'technology',
      description: 'Tech companies and services',
    },
  })

  const industrialCategory = await db.category.create({
    data: {
      name: 'Industrial & Tools',
      slug: 'industrial-tools',
      description: 'Industrial equipment, power tools, and machinery',
    },
  })

  // Create Brands
  const boschBrand = await db.brand.create({
    data: {
      name: 'Bosch',
      slug: 'bosch',
      description: 'Leading manufacturer of power tools and accessories',
      logo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop',
    },
  })

  const makitaBrand = await db.brand.create({
    data: {
      name: 'Makita',
      slug: 'makita',
      description: 'Professional power tools and equipment',
      logo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&h=100&fit=crop',
    },
  })

  const dewaltBrand = await db.brand.create({
    data: {
      name: 'DeWalt',
      slug: 'dewalt',
      description: 'High-performance power tools for professionals',
      logo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop',
    },
  })

  console.log('Created categories and brands')

  // Create Jakson Enterprises Business Admin
  const businessAdminPassword = await hashPassword('business123')
  const businessAdmin = await db.user.create({
    data: {
      email: 'admin@jaksonenterprises.com',
      name: 'Jakson Enterprises Admin',
      password: businessAdminPassword,
      role: UserRole.BUSINESS_ADMIN,
    },
  })

  // Create Jakson Enterprises business
  const jaksonBusiness = await db.business.upsert({
    where: { slug: 'jakson-enterprises' },
    update: {
      name: 'Jakson Enterprises',
      slug: 'jakson-enterprises',
      description: 'Leading wholesaler of power tools and related accessories in Agra. Specializing in cutting blades, grinders, drills, and industrial equipment. Associated companies serve as distributors for solar panels, generators, and industrial ball bearings.',
      logo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop',
      address: 'Industrial Area, Agra, Uttar Pradesh, India',
      phone: '+91 98765 43210',
      email: 'info@jaksonenterprises.com',
      website: 'https://jaksonenterprises.com',
      adminId: businessAdmin.id,
      categoryId: industrialCategory.id,
      heroContent: {
        slides: [
          {
            image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=600&fit=crop',
            headline: 'Jakson Enterprises - Power Tools & Industrial Solutions',
            subheadline: 'Your trusted wholesaler for premium power tools, cutting blades, grinders, and industrial equipment in Agra',
            cta: 'Explore Our Products'
          },
          {
            image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&h=600&fit=crop',
            headline: 'Associated Companies',
            subheadline: 'Comprehensive solutions including solar panels, generators, and industrial ball bearings',
            cta: 'View All Services'
          }
        ]
      },
      brandContent: {
        brands: [
          { name: 'Bosch', logo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop' },
          { name: 'Makita', logo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&h=100&fit=crop' },
          { name: 'DeWalt', logo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop' },
          { name: 'SolarTech', logo: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=100&h=100&fit=crop' },
          { name: 'PowerGen', logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop' }
        ]
      },
      additionalContent: `
        <h2>About Jakson Enterprises</h2>
        <p>Jakson Enterprises is a premier wholesaler and distributor of power tools and industrial equipment, proudly serving the Agra region and beyond. With years of experience in the industry, we have established ourselves as a trusted partner for businesses seeking high-quality tools and equipment.</p>

        <h2>Our Product Range</h2>
        <ul>
          <li><strong>Power Tools:</strong> Drills, grinders, saws, and cutting equipment</li>
          <li><strong>Cutting Blades:</strong> Diamond blades, circular saw blades, and specialty cutting tools</li>
          <li><strong>Accessories:</strong> Tool bits, drill bits, grinding discs, and safety equipment</li>
          <li><strong>Industrial Equipment:</strong> Heavy machinery and specialized industrial tools</li>
        </ul>

        <h2>Associated Companies & Services</h2>
        <p>Through our network of associated companies, we also provide comprehensive solutions in:</p>
        <ul>
          <li>Solar panel installation and maintenance</li>
          <li>Generator sales and service</li>
          <li>Industrial ball bearings and mechanical components</li>
          <li>Energy-efficient solutions for industrial applications</li>
        </ul>

        <h2>Why Choose Jakson Enterprises?</h2>
        <ul>
          <li>Wholesale pricing for bulk orders</li>
          <li>Genuine products from trusted manufacturers</li>
          <li>Expert technical support and consultation</li>
          <li>Reliable delivery and after-sales service</li>
          <li>Established presence in Agra and surrounding areas</li>
        </ul>

        <h2>Quality Assurance</h2>
        <p>We maintain strict quality control standards and work directly with leading manufacturers to ensure that our customers receive only the best products. Our team of experienced professionals is committed to providing exceptional service and support to all our business partners.</p>
      `
    },
    create: {
      name: 'Jakson Enterprises',
      slug: 'jakson-enterprises',
      description: 'Leading wholesaler of power tools and related accessories in Agra. Specializing in cutting blades, grinders, drills, and industrial equipment. Associated companies serve as distributors for solar panels, generators, and industrial ball bearings.',
      logo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop',
      address: 'Industrial Area, Agra, Uttar Pradesh, India',
      phone: '+91 98765 43210',
      email: 'info@jaksonenterprises.com',
      website: 'https://jaksonenterprises.com',
      adminId: businessAdmin.id,
      categoryId: industrialCategory.id,
      heroContent: {
        slides: [
          {
            image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=600&fit=crop',
            headline: 'Jakson Enterprises - Power Tools & Industrial Solutions',
            subheadline: 'Your trusted wholesaler for premium power tools, cutting blades, grinders, and industrial equipment in Agra',
            cta: 'Explore Our Products'
          },
          {
            image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&h=600&fit=crop',
            headline: 'Associated Companies',
            subheadline: 'Comprehensive solutions including solar panels, generators, and industrial ball bearings',
            cta: 'View All Services'
          }
        ]
      },
      brandContent: {
        brands: [
          { name: 'Bosch', logo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop' },
          { name: 'Makita', logo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=100&h=100&fit=crop' },
          { name: 'DeWalt', logo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=100&h=100&fit=crop' },
          { name: 'SolarTech', logo: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=100&h=100&fit=crop' },
          { name: 'PowerGen', logo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop' }
        ]
      },
      additionalContent: `
        <h2>About Jakson Enterprises</h2>
        <p>Jakson Enterprises is a premier wholesaler and distributor of power tools and industrial equipment, proudly serving the Agra region and beyond. With years of experience in the industry, we have established ourselves as a trusted partner for businesses seeking high-quality tools and equipment.</p>

        <h2>Our Product Range</h2>
        <ul>
          <li><strong>Power Tools:</strong> Drills, grinders, saws, and cutting equipment</li>
          <li><strong>Cutting Blades:</strong> Diamond blades, circular saw blades, and specialty cutting tools</li>
          <li><strong>Accessories:</strong> Tool bits, drill bits, grinding discs, and safety equipment</li>
          <li><strong>Industrial Equipment:</strong> Heavy machinery and specialized industrial tools</li>
        </ul>

        <h2>Associated Companies & Services</h2>
        <p>Through our network of associated companies, we also provide comprehensive solutions in:</p>
        <ul>
          <li>Solar panel installation and maintenance</li>
          <li>Generator sales and service</li>
          <li>Industrial ball bearings and mechanical components</li>
          <li>Energy-efficient solutions for industrial applications</li>
        </ul>

        <h2>Why Choose Jakson Enterprises?</h2>
        <ul>
          <li>Wholesale pricing for bulk orders</li>
          <li>Genuine products from trusted manufacturers</li>
          <li>Expert technical support and consultation</li>
          <li>Reliable delivery and after-sales service</li>
          <li>Established presence in Agra and surrounding areas</li>
        </ul>

        <h2>Quality Assurance</h2>
        <p>We maintain strict quality control standards and work directly with leading manufacturers to ensure that our customers receive only the best products. Our team of experienced professionals is committed to providing exceptional service and support to all our business partners.</p>
      `
    }
  })

  // Create Jakson Enterprises products
  await db.product.createMany({
    data: [
      {
        name: 'Power Drill Set',
        description: 'Professional-grade cordless power drills with variable speed control and multiple attachments',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
        businessId: jaksonBusiness.id,
        categoryId: industrialCategory.id,
        brandId: boschBrand.id,
        inStock: true,
        isActive: true,
      },
      {
        name: 'Angle Grinder',
        description: 'Heavy-duty angle grinders with diamond cutting blades for metal and concrete work',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop',
        businessId: jaksonBusiness.id,
        categoryId: industrialCategory.id,
        brandId: makitaBrand.id,
        inStock: true,
        isActive: true,
      },
      {
        name: 'Cutting Blade Set',
        description: 'Diamond-tipped cutting blades for various materials including stone, tile, and metal',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
        businessId: jaksonBusiness.id,
        categoryId: industrialCategory.id,
        brandId: dewaltBrand.id,
        inStock: true,
        isActive: true,
      },
      {
        name: 'Solar Panel Installation Kit',
        description: 'Complete solar panel installation packages with mounting hardware and inverters',
        image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&h=300&fit=crop',
        businessId: jaksonBusiness.id,
        categoryId: techCategory.id,
        inStock: true,
        isActive: true,
      },
      {
        name: 'Industrial Generator',
        description: 'Heavy-duty diesel generators for industrial and commercial applications',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        businessId: jaksonBusiness.id,
        categoryId: industrialCategory.id,
        inStock: true,
        isActive: true,
      },
      {
        name: 'Ball Bearing Assortment',
        description: 'High-precision industrial ball bearings in various sizes and specifications',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
        businessId: jaksonBusiness.id,
        categoryId: industrialCategory.id,
        inStock: true,
        isActive: true,
      },
    ],
  })

  // Create sample inquiries for Jakson Enterprises
  await db.inquiry.createMany({
    data: [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@construction.com',
        phone: '+91 98765 12345',
        message: 'I need a bulk order of angle grinders and cutting blades for our construction project. Please provide wholesale pricing.',
        businessId: jaksonBusiness.id,
        userId: businessAdmin.id,
        status: InquiryStatus.NEW,
      },
      {
        name: 'Priya Sharma',
        email: 'priya@industrial.com',
        phone: '+91 87654 32109',
        message: 'Looking for industrial ball bearings and solar panel installation services for our manufacturing facility.',
        businessId: jaksonBusiness.id,
        userId: businessAdmin.id,
        status: InquiryStatus.READ,
      },
    ],
  })

  console.log('Created Jakson Enterprises business and data')
  console.log('Database seeded successfully!')
  console.log('\nLogin credentials:')
  console.log('Super Admin: admin@bdpp.com / admin123')
  console.log('Business Admin: admin@jaksonenterprises.com / business123')
  console.log('\nJakson Enterprises URL: /jakson-enterprises')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })