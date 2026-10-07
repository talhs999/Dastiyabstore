const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const srcDir = 'C:\\Users\\IQRA TRADERS\\.gemini\\antigravity-ide\\brain\\2533f901-3f20-4515-8bfb-1f5dd68a1a96\\scratch\\mashallah_images';
const destDir = path.join(process.cwd(), 'public', 'images', 'mashallah-store');

const STORE_ID = '5e4838be-7384-4d1b-8766-3124a7bd60b0'; // Mashallah Store
const CLOTHING_CAT_ID = '955c999a-42b6-4fa3-82b5-fcbe02729e5c'; // Clothing

const kidsNames = [
  "Kids Cute Animal Print 2-Piece Lounge Set",
  "Kids Duck Graphic Summer Tee & Jogger Set",
  "Kids Cool Bunny Printed Casual 2-Piece Suit",
  "Kids Cheerful Floral 2-Piece Summer Pajama",
  "Kids Bear & Friends Comfortable Cotton Set",
  "Kids Urban Street Print T-Shirt & Shorts Set",
  "Kids Whimsical Kitty Cat 2-Piece Nightwear",
  "Kids Playful Cartoon Printed Home Suit",
  "Kids Sweet Heart Pattern Daily Casual Set",
  "Kids Sunny Days Graphic T-Shirt & Trouser",
  "Kids Modern Geometric Print 2-Piece Set",
  "Kids Happy Dino Adventure Cotton Lounge Set",
  "Kids Minimalist Aesthetic 2-Piece Casuals",
  "Kids Vibrant Pastel Blossom Night Suit",
  "Kids Active Sports Print Tee & Shorts Set",
  "Kids Starry Dream Soft Fabric Nightwear",
  "Kids Safari Animal Print 2-Piece Set",
  "Kids Funky Typography Casual Lounge Suit",
  "Kids Cozy Teddy Bear Fleece Pajama Set",
  "Kids Summer Breeze Lightweight Cotton Suit",
  "Kids Panda Express Graphic 2-Piece Pajamas",
  "Kids Rainbow Vibes Soft Cotton Lounge Set",
  "Kids Little Champion Sports Graphic Suit",
  "Kids Classic Striped & Graphic 2-Piece Set",
  "Kids Sweet Treats Cupcake Printed Nightwear",
  "Kids Space Galaxy Astronaut Cotton Suit",
  "Kids Sunshine Yellow Floral Casual Set",
  "Kids Bubblegum Pink Playtime 2-Piece Suit",
  "Kids Fresh Mint Green Printed Lounge Set",
  "Kids Vintage Daisy Floral Cotton Pajama",
  "Kids Cool Dude Streetwear T-Shirt & Jogger",
  "Kids Little Princess Soft Nightwear Suit",
  "Kids Happy Puppy Print 2-Piece Casuals",
  "Kids Tropical Palm Summer T-Shirt & Shorts",
  "Kids Dream Big Star Graphic Pajama Set",
  "Kids Marvelous Fun Printed Cotton Suit",
  "Kids Honey Bee Blossom 2-Piece Loungewear",
  "Kids Blue Waves Relaxed Cotton Pajama",
  "Kids Retro Comic Pop Art Graphic Set",
  "Kids Soft Peach Bunny Ear Lounge Suit",
  "Kids Wild Explorer Animal Printed Set",
  "Kids Sweet Cherries Printed Nightwear",
  "Kids Midnight Star Cozy Cotton 2-Piece",
  "Kids Happy Camper Summer Outdoor Suit",
  "Kids Golden Honey Cartoon Print Pajama"
];

const adultNames = [
  "Women Premium Graphic Printed 2-Piece Night Suit",
  "Women Relaxed Wide-Leg Lounge Co-ord Set",
  "Women Classic Striped Cotton Nightwear Set",
  "Women Chic Street Style Oversized Lounge Suit",
  "Women Floral Blossom Soft Touch Nightwear",
  "Women Minimalist Aesthetic Loungewear Set",
  "Women Contemporary Geometric Print Co-ord",
  "Women Cozy Casual Oversized Tracksuit Set",
  "Women Vintage Botanical Printed Pajama Set",
  "Women Elegant Monochrome Loungewear Suit",
  "Women Pastel Lavender Soft Nightwear Set",
  "Women Parisian Chic Printed Home Pajamas",
  "Women Relaxed Drop-Shoulder Lounge 2-Piece",
  "Women Midnight Navy Star Printed Night Suit",
  "Women Summer Cotton Button-Down Lounge Set",
  "Women Boho Floral Print Cozy Pajama Suit",
  "Women Urban Comfort Wide-Leg Co-ord Set",
  "Women Sweet Heart Pattern Loungewear Set",
  "Women Scandinavian Modernist Print Night Suit",
  "Women Soft Peach Cloud Pajama 2-Piece Set",
  "Women Retro Wave Graphic Cotton Lounge Suit",
  "Women Dusty Rose Blossom Nightwear Set",
  "Women Casual Daily Wear Soft Jersey Co-ord",
  "Women Olive Green Relaxed Silhouette Suit",
  "Women Mocha Brown Coffee Graphic Lounge Set",
  "Women Sunset Coral Breathable Night Suit",
  "Women Charcoal Grey Minimalist Loungewear",
  "Women Abstract Art Printed Luxury Pajamas",
  "Women Sky Blue Dream Soft Cotton Lounge Set",
  "Women Cozy Knit Texture Casual Home Suit",
  "Women Romantic Rose Petal Printed Nightwear",
  "Women Emerald Green Silky Feel Lounge Suit",
  "Women Cherry Blossom Pink Soft Pajama Set",
  "Women Modern Stripe & Typography Night Suit",
  "Women Cream Ivory Relaxed Lounge Co-ord",
  "Women Tropical Oasis Printed Summer Pajamas",
  "Women Sage Green Comfort Fit Nightwear",
  "Women Midnight Floral Printed 2-Piece Suit",
  "Women Cinnamon Spice Soft Cotton Lounge Set",
  "Women Graphic Tee & Wide Trouser Home Set",
  "Women Golden Horizon Printed Nightwear",
  "Women Lilac Breeze Soft Touch Loungewear",
  "Women Classic Dot Pattern Cotton Pajamas",
  "Women Urban Neutral Toned Casual Co-ord",
  "Women Sunset Blossom Wide-Leg Night Suit",
  "Women Ocean Blue Relaxed Fit Loungewear",
  "Women Autumn Leaves Aesthetic Pajama Set",
  "Women Butter Yellow Happy Vibes Night Suit",
  "Women Forest Fern Botanical Lounge Set",
  "Women Ruby Red Romance Printed Pajamas",
  "Women Slate Grey Modern Casual Co-ord",
  "Women Whispering Pines Soft Cotton Set",
  "Women Timeless Elegance Printed Night Suit"
];

async function main() {
  console.log('Starting Mashallah Store product processing...');

  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.jpeg'));
  const kidsFiles = [];
  const adultFiles = [];

  for (const f of files) {
    if (f === 'WhatsApp Image 2026-10-04 at 11.49.44 PM (1).jpeg' || f === 'WhatsApp Image 2026-10-04 at 11.50.17 PM (1).jpeg') continue;

    const fullPath = path.join(srcDir, f);
    const meta = await sharp(fullPath).metadata();

    const w = Math.floor(meta.width * 0.28);
    const h = Math.floor(meta.height * 0.22);
    const y = Math.floor(meta.height * 0.05);

    const leftData = await sharp(fullPath)
      .extract({ left: Math.floor(meta.width * 0.03), top: y, width: w, height: h })
      .raw()
      .toBuffer({ resolveWithObject: true });

    let leftWhite = 0;
    for (let i = 0; i < leftData.data.length; i += leftData.info.channels) {
      if (leftData.data[i] >= 248 && leftData.data[i+1] >= 248 && leftData.data[i+2] >= 248) leftWhite++;
    }
    const leftRatio = leftWhite / (leftData.info.width * leftData.info.height);

    const rightData = await sharp(fullPath)
      .extract({ left: Math.floor(meta.width * 0.65), top: y, width: w, height: h })
      .raw()
      .toBuffer({ resolveWithObject: true });

    let rightWhite = 0;
    for (let i = 0; i < rightData.data.length; i += rightData.info.channels) {
      if (rightData.data[i] >= 248 && rightData.data[i+1] >= 248 && rightData.data[i+2] >= 248) rightWhite++;
    }
    const rightRatio = rightWhite / (rightData.info.width * rightData.info.height);

    const maxRatio = Math.max(leftRatio, rightRatio);
    if (maxRatio >= 0.025) {
      kidsFiles.push(f);
    } else {
      adultFiles.push(f);
    }
  }

  console.log(`Identified ${kidsFiles.length} Kids suits and ${adultFiles.length} Adult suits.`);

  // 1. Process Kids Products
  for (let i = 0; i < kidsFiles.length; i++) {
    const origFile = kidsFiles[i];
    const newFileName = `kids-suit-${String(i + 1).padStart(2, '0')}.webp`;
    const targetPath = path.join(destDir, newFileName);

    // Optimize and convert to webp
    await sharp(path.join(srcDir, origFile))
      .webp({ quality: 85 })
      .toFile(targetPath);

    const publicUrl = `/images/mashallah-store/${newFileName}`;
    const name = kidsNames[i] || `Kids Designer 2-Piece Suit #${i + 1}`;
    const slug = `mashallah-kids-suit-${i + 1}`;

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name,
          slug,
          price: 1450,
          original_price: 1850,
          buying_cost: 1100,
          image: publicUrl,
          images: [],
          rating: 5.0,
          reviews: Math.floor(Math.random() * 8) + 3,
          badge: i < 5 ? "Best Seller" : (i < 10 ? "New Arrival" : null),
          badge_type: i < 5 ? "yellow" : "red",
          in_stock: true,
          stock_quantity: 25,
          category_id: CLOTHING_CAT_ID,
          store_id: STORE_ID,
          description: `Super comfortable and skin-friendly 2-piece lounge set for kids. Made with premium breathable cotton fabric, featuring vibrant prints and an elastic waistband for all-day playtime and nighttime comfort. Available in multiple age sizes.`,
          sizes: ["1-2 Years", "3-4 Years", "5-6 Years", "7-8 Years", "9-10 Years"],
          specs: [
            { label: "Fabric", value: "100% Breathable Combed Cotton" },
            { label: "Pieces Included", value: "2 Piece (Shirt + Trouser/Shorts)" },
            { label: "Age Group", value: "1 to 10 Years" },
            { label: "Washing Care", value: "Machine Wash Cold / Gentle" }
          ],
          trust_points: [
            { icon: "truck", text: "Cash on Delivery across Pakistan" },
            { icon: "rotate-ccw", text: "5-day easy size exchange" },
            { icon: "shield", text: "100% skin-safe & soft fabric" }
          ],
          is_featured: i < 4,
          is_best_seller: i < 6
        }
      });
      console.log(`[Created Kids Product ${i + 1}] ${name}`);
    } else {
      console.log(`[Skipped Kids Product ${i + 1}] Already exists`);
    }
  }

  // 2. Process Adult Products
  for (let i = 0; i < adultFiles.length; i++) {
    const origFile = adultFiles[i];
    const newFileName = `women-suit-${String(i + 1).padStart(2, '0')}.webp`;
    const targetPath = path.join(destDir, newFileName);

    // Optimize and convert to webp
    await sharp(path.join(srcDir, origFile))
      .webp({ quality: 85 })
      .toFile(targetPath);

    const publicUrl = `/images/mashallah-store/${newFileName}`;
    const name = adultNames[i] || `Women Chic Loungewear Suit #${i + 1}`;
    const slug = `mashallah-women-suit-${i + 1}`;

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.product.create({
        data: {
          name,
          slug,
          price: 1750,
          original_price: 2250,
          buying_cost: 1350,
          image: publicUrl,
          images: [],
          rating: 5.0,
          reviews: Math.floor(Math.random() * 10) + 4,
          badge: i < 5 ? "Trending" : (i < 12 ? "Best Seller" : null),
          badge_type: "yellow",
          in_stock: true,
          stock_quantity: 20,
          category_id: CLOTHING_CAT_ID,
          store_id: STORE_ID,
          description: `Effortlessly stylish and ultra-comfortable 2-piece nightwear and lounge suit for women. Crafted with lightweight, breathable fabric with a relaxed drape, perfect for everyday home comfort and sleepwear.`,
          sizes: ["Medium", "Large", "XL"],
          specs: [
            { label: "Fabric", value: "Premium Soft Cotton Jersey / Rayon Blend" },
            { label: "Set Includes", value: "2-Piece (Full Shirt + Trouser)" },
            { label: "Fit", value: "Relaxed Loungewear Comfort Fit" },
            { label: "Care Instructions", value: "Hand / Machine Wash Cold" }
          ],
          trust_points: [
            { icon: "truck", text: "Cash on Delivery across Pakistan" },
            { icon: "rotate-ccw", text: "5-day hassle-free exchange policy" },
            { icon: "shield", text: "Non-fade colors & durable stitching" }
          ],
          is_featured: i < 4,
          is_best_seller: i < 8
        }
      });
      console.log(`[Created Adult Product ${i + 1}] ${name}`);
    } else {
      console.log(`[Skipped Adult Product ${i + 1}] Already exists`);
    }
  }

  console.log('✅ ALL MASHALLAH STORE PRODUCTS CREATED SUCCESSFULLY!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
