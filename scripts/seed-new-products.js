const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables (.env.production or .env)
const prodEnv = path.resolve(process.cwd(), '.env.production');
if (fs.existsSync(prodEnv)) {
  dotenv.config({ path: prodEnv });
} else {
  dotenv.config();
}

const prisma = new PrismaClient({
  datasources: process.env.DATABASE_URL
    ? { db: { url: process.env.DATABASE_URL } }
    : undefined
});

const trustPoints = [
  { icon: 'truck', text: 'Fast delivery nationwide within 2-4 working days' },
  { icon: 'shield', text: '100% brand new, checked & quality guaranteed' },
  { icon: 'rotate-ccw', text: '7-day easy exchange & replacement guarantee' },
  { icon: 'zap', text: 'Cash on Delivery available all across Pakistan' }
];

async function main() {
  console.log('Connecting to database...');

  // 1. Ensure Categories Exist
  let makeupCat = await prisma.category.findUnique({ where: { slug: 'makeup-personal-care' } });
  if (!makeupCat) {
    makeupCat = await prisma.category.create({
      data: {
        name: 'Makeup & Personal Care',
        slug: 'makeup-personal-care',
        icon: 'Sparkles',
        is_in_sidebar: true,
        is_in_header: true
      }
    });
    console.log('Created Category: Makeup & Personal Care');
  }

  let nightLightsCat = await prisma.category.findUnique({ where: { slug: 'night-lights' } });
  if (!nightLightsCat) {
    nightLightsCat = await prisma.category.create({
      data: {
        name: 'Night Lights',
        slug: 'night-lights',
        icon: 'Moon',
        is_in_sidebar: true,
        is_in_header: true
      }
    });
    console.log('Created Category: Night Lights');
  }

  let speakersCat = await prisma.category.findUnique({ where: { slug: 'bluetooth-speakers' } });
  if (!speakersCat) {
    speakersCat = await prisma.category.create({
      data: {
        name: 'Bluetooth Speakers',
        slug: 'bluetooth-speakers',
        icon: 'Speaker',
        is_in_sidebar: true,
        is_in_header: true
      }
    });
    console.log('Created Category: Bluetooth Speakers');
  }

  // 2. Define Products (Using only admin PREDEFINED_COLORS options)
  const productsToSeed = [
    {
      name: 'BIGERBOWIE Novelty iPhone 11-Color Eyeshadow Palette with Beaded Wristlet Strap',
      slug: 'bigerbowie-iphone-eyeshadow-palette-11-colors',
      price: 899,
      original_price: 1299,
      buying_cost: 500,
      category_id: makeupCat.id,
      image: '/images/products/iphone-eyeshadow-palette-1.webp',
      images: ['/images/products/iphone-eyeshadow-palette-2.webp'],
      rating: 4.9,
      reviews: 38,
      badge: 'TRENDING NOVELTY',
      badge_type: 'bestseller',
      is_new: true,
      in_stock: true,
      stock_quantity: 50,
      is_featured: true,
      is_best_seller: true,
      free_delivery_karachi: true,
      free_delivery_nationwide: false,
      colors: [
        { name: 'Purple', hex: '#a855f7' },
        { name: 'Blue', hex: '#3b82f6' },
        { name: 'Pink', hex: '#ec4899' },
        { name: 'Green', hex: '#22c55e' }
      ],
      specs: [
        { label: 'Brand & Model', value: 'BIGERBOWIE (Model 2198D)' },
        { label: 'Shades Count', value: '11 Multi-Finish Eyeshadow Colors' },
        { label: 'Finishes', value: 'Velvet Matte, Metallic Shimmer & High-Sparkle Glitter' },
        { label: 'Wear Time', value: '12 Hours Long Lasting & Crease-Resistant' },
        { label: 'Design', value: 'iPhone Triple-Camera Flip Case with Dual-Sponge Applicator' },
        { label: 'Accessories', value: 'Detachable Beaded Pearl & Bow Wristlet Bracelet Charm' },
        { label: 'Skin Type', value: 'All Skin Types (Hypoallergenic & Smooth Texture)' },
        { label: 'Dimensions', value: 'Compact Pocket Size (13.5cm x 6.5cm)' }
      ],
      features: [
        'Viral TikTok & Instagram aesthetic iPhone flip-cover novelty design',
        '11 high-pigmentation shades ranging from everyday warm nudes to evening glam glitters',
        'Smooth, ultra-blendable butter-soft formula that delivers zero fallout',
        'Includes an adorable rainbow pearl & bow wristlet bracelet charm for easy carrying',
        'Built-in dual-tip eyeshadow sponge brush for quick on-the-go touch-ups',
        'Waterproof and sweat-resistant formula with up to 12 hours of vibrant wear',
        'Perfect cute makeup gift for girls, teens, makeup lovers, and birthday surprises'
      ],
      trust_points: trustPoints,
      description: `<p>Step up your beauty routine with the most viral and adorable novelty cosmetic of the season — the <strong>BIGERBOWIE iPhone-Shaped 11-Color Eyeshadow Palette</strong>! Styled like an ultra-chic smartphone with rear camera details and a flip-open screen, this palette combines trendy aesthetics with professional-grade cosmetic performance.</p>

<h3>✨ Why You'll Fall in Love With It:</h3>
<ul>
  <li><strong>11 Ultra-Pigmented Shades:</strong> Carefully curated mix of velvety smooth mattes, radiant pearlescent shimmers, and luminous glitters that blend effortlessly.</li>
  <li><strong>Clever Phone Case Design:</strong> Opens smoothly like a flip phone, keeping your shades protected and mess-free inside your handbag or clutch.</li>
  <li><strong>Handmade Beaded Wristlet Charm:</strong> Comes with a detachable pastel pearl wristband adorned with a crystalline bow charm — carry it like a mini purse or accessorize your makeup pouch!</li>
  <li><strong>Dual-Ended Sponge Applicator:</strong> Includes a dedicated sponge applicator brush built right into the compact tray for precision application anywhere, anytime.</li>
  <li><strong>12H Long-Lasting Stay:</strong> Waterproof, sweat-resistant formula resists creasing and fading throughout your busiest days and nights out.</li>
</ul>

<h3>🎨 Available Case Colors:</h3>
<p>Choose from 4 gorgeous shades: <strong>Purple</strong>, <strong>Blue</strong>, <strong>Pink</strong>, and <strong>Green</strong>.</p>

<h3>🎁 The Ultimate Gift Idea:</h3>
<p>Whether for birthdays, bridal giveaways, Eid gifts, or treating yourself, this palette is guaranteed to bring smiles and compliments every time you pull it out of your bag!</p>`
    },
    {
      name: 'JB! M3-T Mini Portable Bluetooth Speaker with Hi-Fi Audio & MicroSD Support',
      slug: 'jbl-m3t-mini-portable-bluetooth-speaker',
      price: 999,
      original_price: 1499,
      buying_cost: 600,
      category_id: speakersCat.id,
      image: '/images/products/jbl-m3t-mini-speaker-1.webp',
      images: ['/images/products/jbl-m3t-mini-speaker-2.webp'],
      rating: 4.8,
      reviews: 42,
      badge: 'SUPER BASS',
      badge_type: 'bestseller',
      is_new: true,
      in_stock: true,
      stock_quantity: 50,
      is_featured: true,
      is_best_seller: true,
      free_delivery_karachi: true,
      free_delivery_nationwide: false,
      colors: [
        { name: 'Blue', hex: '#3b82f6' },
        { name: 'Black', hex: '#000000' },
        { name: 'Silver', hex: '#C0C0C0' }
      ],
      specs: [
        { label: 'Model', value: 'JB! M3-T (Best Sound Series by HARMAN)' },
        { label: 'Connectivity', value: 'Bluetooth 5.3 Wireless (10m Range)' },
        { label: 'Charging Port', value: 'Modern Type-C Fast Charging' },
        { label: 'Memory Card', value: 'MicroSD / TF Card Slot (Up to 32GB)' },
        { label: 'Speaker Output', value: '5W High-Fidelity Deep Bass Acoustic Driver' },
        { label: 'Battery Life', value: 'Up to 4-6 Hours Continuous Playtime (24h Standby)' },
        { label: 'Microphone', value: 'Built-in HD Mic for Hands-Free Phone Calls' },
        { label: 'Body Material', value: 'Premium Anodized Aluminum Alloy Shell' },
        { label: 'Compatibility', value: 'Smartphones (iOS/Android), Laptops, Tablets, Smart TVs' }
      ],
      features: [
        'Incredible pocket-sized mini speaker with unexpectedly loud, crystal-clear Hi-Fi audio',
        'Engineered with an acoustic bass radiator that delivers rich, distortion-free low ends',
        'Modern Type-C charging port for universally fast and convenient recharges',
        'Standalone music playback via Micro SD / TF card slot — play tunes without connecting a phone',
        'Sleek metallic spherical shell with non-slip rubber base that dampens surface vibrations',
        'Built-in noise-cancelling microphone for crisp hands-free calls and conference meetings',
        'Ultra-portable featherlight design fits comfortably in your pocket, palm, or backpack pocket'
      ],
      trust_points: trustPoints,
      description: `<p>Experience massive sound from a speaker that fits in the palm of your hand! The <strong>JB! M3-T Mini Portable Bluetooth Speaker</strong> is precision-engineered with an anodized aluminum metal chassis and a powerful 5W acoustic driver to deliver room-filling clarity and deep bass wherever life takes you.</p>

<h3>🔊 Huge Sound, Tiny Footprint:</h3>
<ul>
  <li><strong>Hi-Fi Acoustic Audio:</strong> Specially tuned sound chamber produces rich mids, sparkling highs, and punchy bass that defies its pocket-friendly size.</li>
  <li><strong>Versatile Type-C Fast Interface:</strong> Equipped with modern Type-C charging, so you can easily power up with the same cable you use for your smartphone.</li>
  <li><strong>Direct Micro SD / TF Card Playback:</strong> Insert your favorite memory card packed with songs and enjoy direct audio playback even when your phone is turned off or away.</li>
  <li><strong>Premium Metal Alloy Body:</strong> Crafted with a luxurious brushed metallic finish that feels durable, scratch-resistant, and extraordinarily premium.</li>
  <li><strong>Hands-Free HD Calling:</strong> An integrated microphone allows you to take calls directly through the speaker with exceptional clarity.</li>
</ul>

<h3>📦 What's in the Box:</h3>
<p>1x JB! M3-T Mini Speaker, 1x Type-C Fast Charging Cable, 1x User Manual.</p>`
    },
    {
      name: '360° Rotating Star & Moon Galaxy Projector Night Light Lamp with 4-LED Color Modes',
      slug: 'rotating-star-moon-projector-night-light-lamp',
      price: 1199,
      original_price: 1699,
      buying_cost: 700,
      category_id: nightLightsCat.id,
      image: '/images/products/star-master-projector-lamp-1.webp',
      images: ['/images/products/star-master-projector-lamp-2.webp'],
      rating: 4.9,
      reviews: 56,
      badge: 'BESTSELLER',
      badge_type: 'bestseller',
      is_new: true,
      in_stock: true,
      stock_quantity: 50,
      is_featured: true,
      is_best_seller: true,
      free_delivery_karachi: true,
      free_delivery_nationwide: false,
      colors: [],
      specs: [
        { label: 'Product Type', value: 'Dual-Function 360° Rotating Star Master Night Light' },
        { label: 'LED Modes', value: '4 High-Power LEDs (Warm White, Blue, Red, Green)' },
        { label: 'Projection Effects', value: '8 Different Light Combinations & Starlight Patterns' },
        { label: 'Rotation', value: 'Silent 360-Degree Motorized Rotating Mechanism' },
        { label: 'Control Buttons', value: '3 Tactile Push Buttons (A: Warm Light, B: Colors, C: Rotation)' },
        { label: 'Power Source', value: 'Dual Powered (Included 5V USB Cable OR 4x AAA Batteries)' },
        { label: 'Dimensions', value: '4.7 inches (Width) x 5.3 inches (Height)' },
        { label: 'Material', value: 'Non-Toxic Child-Safe ABS + PVC Dome' }
      ],
      features: [
        'Transforms any ceiling and wall into an enchanting cosmic starry night with glowing moon & stars',
        'Dual-use innovation: keep the frosted white dome on for a soothing bedside night light, or remove it for HD star projection',
        'Smooth, whisper-quiet 360° motorized rotation creates a relaxing, hypnotic sleep ambiance',
        '8 dynamic projection color combinations to suit every mood, bedtime story, or celebration',
        'Dual power flexibility — plug into any USB phone charger / power bank, or run cordlessly on 4x AAA batteries',
        'Helps babies, toddlers, and young kids overcome fear of the dark and fall asleep peacefully',
        'Ideal home decor accent for bedrooms, nurseries, birthday parties, festive decor, and photography'
      ],
      trust_points: trustPoints,
      description: `<p>Bring the magical wonders of the galaxy into your home! The <strong>360° Rotating Star & Moon Projector Night Light</strong> projects a crisp, vibrant cosmos of stars and crescent moons across your room's walls and ceiling, creating an awe-inspiring, tranquil atmosphere for children and adults alike.</p>

<h3>✨ 2-in-1 Dual Functionality:</h3>
<ul>
  <li><strong>Bedside Night Light:</strong> Leave the frosted white outer dome on to produce a soft, warm, non-glare glow that illuminates the room gently for relaxing sleep or nighttime feeding.</li>
  <li><strong>Immersive Starlight Projector:</strong> Remove the top dome to unleash high-definition starry night sky projections across every corner of your room!</li>
</ul>

<h3>🎛️ Simple 3-Button Controls:</h3>
<ul>
  <li><strong>Button A (Warm Light):</strong> Turns on a warm white ambient glow, ideal as a reading or sleeping lamp.</li>
  <li><strong>Button B (Color Changing Switch):</strong> Cycles through monochrome and vibrant multi-color star combinations (Blue, Green, Red, Multi-Mix).</li>
  <li><strong>Button C (Rotation Switch):</strong> Activates the ultra-quiet 360° rotation that brings constellations gently alive across the room.</li>
</ul>

<h3>🔌 Dual Power Flexibility:</h3>
<p>Powered conveniently via the included <strong>USB cable (DC 5V)</strong> connected to any phone charger, power bank, or laptop, or use <strong>4x AAA batteries</strong> (not included) for 100% wireless portability anywhere in your home or during travel!</p>

<h3>🎁 Perfect Gift Choice:</h3>
<p>A mesmerizing gift for kids, toddlers, couples, and space enthusiasts for birthdays, holidays, Eid, and room makeover surprises.</p>`
    }
  ];

  // 3. Upsert products in database
  for (const prod of productsToSeed) {
    const existing = await prisma.product.findUnique({ where: { slug: prod.slug } });
    if (existing) {
      await prisma.product.update({
        where: { slug: prod.slug },
        data: prod
      });
      console.log(`Updated product: ${prod.name}`);
    } else {
      await prisma.product.create({
        data: prod
      });
      console.log(`Created product: ${prod.name}`);
    }
  }

  const total = await prisma.product.count();
  console.log(`\nDONE! Total products now in database: ${total}`);
}

main()
  .catch(err => {
    console.error('Seed Error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
