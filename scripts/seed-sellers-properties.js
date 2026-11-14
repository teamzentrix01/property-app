const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Sellers requested by user:
// 1. chandansaini480@gmail.com
// 2. imamoradabad931@gmail.com
// 3. mtbossmtboss95@gmail.com (already exists)
// 4. cszentrix01tech@gmail.com
// 5. adminmeva9991@gmail.com

const SELLERS = [
  {
    name: "Chandan Saini",
    email: "chandansaini480@gmail.com",
    phone: "9876543210",
    password: "Password@123",
    role: "OWNER"
  },
  {
    name: "Mohd Imran",
    email: "imamoradabad931@gmail.com",
    phone: "9876543211",
    password: "Password@123",
    role: "OWNER"
  },
  {
    name: "Aman Kumar",
    email: "mtbossmtboss95@gmail.com",
    phone: "9876543212",
    password: "Password@123",
    role: "OWNER"
  },
  {
    name: "Zentrix Tech",
    email: "cszentrix01tech@gmail.com",
    phone: "9876543213",
    password: "Password@123",
    role: "OWNER"
  },
  {
    name: "Admin Meva",
    email: "adminmeva9991@gmail.com",
    phone: "9876543214",
    password: "Password@123",
    role: "OWNER"
  }
];

// Target 5 Cities that currently have NO properties:
// 1. Gurugram (Haryana)
// 2. Noida (Uttar Pradesh)
// 3. Delhi (Delhi)
// 4. Greater Noida (Uttar Pradesh)
// 5. Lucknow (Uttar Pradesh)

const CITY_PROPERTIES = [
  {
    city: "Gurugram",
    state: "Haryana",
    area: "Golf Course Extension Road",
    title: "Luxury 3 BHK High-Rise Apartment with Golf Views",
    purpose: "SALE",
    propertyType: "FLAT",
    price: 18500000,
    sizeValue: 1850,
    sizeUnit: "sqft",
    bedrooms: 3,
    bathrooms: 3,
    facing: "North-East",
    description: "Premium 3 BHK apartment located in prime Golf Course Extension, Gurugram. Fully equipped clubhouse, 24/7 security, covered car parking, and lush landscaped gardens.",
    photos: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
    ],
    categories: ["CITIES", "APARTMENT", "LUXURY"]
  },
  {
    city: "Noida",
    state: "Uttar Pradesh",
    area: "Sector 150",
    title: "Modern 4 BHK Premium Villa with Private Garden",
    purpose: "SALE",
    propertyType: "HOUSE",
    price: 26000000,
    sizeValue: 2800,
    sizeUnit: "sqft",
    bedrooms: 4,
    bathrooms: 4,
    facing: "North",
    description: "Architect-designed 4 BHK duplex villa situated in the greenest sector of Noida, Sector 150. Features private lawn, solar power, modular kitchen, and wide roads.",
    photos: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80"
    ],
    categories: ["CITIES", "VILLAS", "LUXURY"]
  },
  {
    city: "Delhi",
    state: "Delhi",
    area: "Dwarka Sector 11",
    title: "Spacious 3 BHK DDA HIG Apartment near Metro",
    purpose: "SALE",
    propertyType: "FLAT",
    price: 14500000,
    sizeValue: 1650,
    sizeUnit: "sqft",
    bedrooms: 3,
    bathrooms: 3,
    facing: "East",
    description: "Well-maintained 3 BHK apartment in peaceful Dwarka sub-city. Walking distance from Metro Station, reputed schools, hospitals, and DDA sports complex.",
    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80"
    ],
    categories: ["CITIES", "APARTMENT"]
  },
  {
    city: "Greater Noida",
    state: "Uttar Pradesh",
    area: "Pari Chowk",
    title: "Prime Commercial Retail Shop with High Footfall",
    purpose: "SALE",
    propertyType: "SHOP",
    price: 7500000,
    sizeValue: 550,
    sizeUnit: "sqft",
    bedrooms: null,
    bathrooms: 1,
    facing: "Main Road",
    description: "Ground floor corner commercial retail shop located right near Pari Chowk, Greater Noida. Excellent visibility, high footfall, ideal for franchise store, clinic, or boutique.",
    photos: [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80"
    ],
    categories: ["CITIES", "COMMERCIAL"]
  },
  {
    city: "Lucknow",
    state: "Uttar Pradesh",
    area: "Gomti Nagar Extension",
    title: "Residential Corner Plot in Gated Township",
    purpose: "SALE",
    propertyType: "PLOT",
    price: 6500000,
    sizeValue: 2150,
    sizeUnit: "sqft",
    plotLength: 60,
    plotWidth: 35.8,
    isCornerPlot: true,
    facing: "North-East",
    description: "LDA-approved freehold residential corner plot in Gomti Nagar Extension, Lucknow. Wide 40ft blacktop road, underground drainage, electricity, and immediate registry/possession.",
    photos: [
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1200&q=80"
    ],
    categories: ["CITIES"]
  }
];

async function seed() {
  console.log("Starting Seller and Property Creation...");

  // Find an admin user to approve listings
  let admin = await prisma.user.findFirst({
    where: { role: { in: ["SUPER_ADMIN", "AREA_ADMIN"] } }
  });

  const createdUsers = [];

  for (const s of SELLERS) {
    const passwordHash = await bcrypt.hash(s.password, 12);
    let user = await prisma.user.findUnique({ where: { email: s.email } });

    if (user) {
      console.log(`Updating existing user: ${s.email}`);
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          verified: true,
          verificationStatus: "ACTIVE",
          passwordHash,
          plainPassword: s.password
        }
      });
    } else {
      console.log(`Creating new user: ${s.email}`);
      user = await prisma.user.create({
        data: {
          name: s.name,
          email: s.email,
          phone: s.phone,
          passwordHash,
          plainPassword: s.password,
          role: s.role,
          verified: true,
          verificationStatus: "ACTIVE",
          preferredCity: "Moradabad"
        }
      });
    }
    createdUsers.push(user);
  }

  console.log(`Verified ${createdUsers.length} sellers.`);

  // Create 5 Properties for 5 unrepresented cities
  for (let i = 0; i < CITY_PROPERTIES.length; i++) {
    const prop = CITY_PROPERTIES[i];
    const seller = createdUsers[i % createdUsers.length];

    console.log(`Creating property in ${prop.city} owned by ${seller.name}...`);

    const listing = await prisma.listing.create({
      data: {
        title: prop.title,
        purpose: prop.purpose,
        propertyType: prop.propertyType,
        postedBy: seller.role,
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: admin ? admin.id : seller.id,
        city: prop.city,
        area: prop.area,
        state: prop.state,
        price: prop.price,
        contactNumber: "7417499974", // Admin central contact number
        sizeValue: prop.sizeValue,
        sizeUnit: prop.sizeUnit,
        plotLength: prop.plotLength || null,
        plotWidth: prop.plotWidth || null,
        isCornerPlot: prop.isCornerPlot || false,
        bedrooms: prop.bedrooms || null,
        bathrooms: prop.bathrooms || null,
        facing: prop.facing,
        description: prop.description,
        ownerId: seller.id,
        photos: {
          create: prop.photos.map(url => ({ url }))
        },
        categories: {
          create: prop.categories.map(category => ({ category }))
        }
      }
    });

    console.log(`✓ Created listing id: ${listing.id} in ${prop.city}`);
  }

  console.log("All sellers and properties created and approved successfully!");
}

seed().catch(console.error).finally(() => prisma.$disconnect());

