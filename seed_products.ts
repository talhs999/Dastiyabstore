import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

function parsePrice(priceStr: string): number {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/Rs\.\s*/g, '').replace(/,/g, '').trim()) || 0;
}

function slugify(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seed() {
    // Read the properly parsed JSON from read_docx.py
    const raw = fs.readFileSync('products_parsed.json', 'utf-8');
    const products = JSON.parse(raw);

    console.log(`Loaded ${products.length} products from products_parsed.json`);

    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        if (!p.name) { console.log(`  Skipping product ${i + 1} — no name`); continue; }

        // Ensure category exists
        const catName = p.category || 'Uncategorized';
        const catSlug = slugify(catName);

        let category = await prisma.category.findUnique({ where: { slug: catSlug } });
        if (!category) {
            category = await prisma.category.create({
                data: { name: catName, slug: catSlug }
            });
            console.log(`  Created category: ${catName}`);
        }

        const productSlug = p.slug || slugify(p.name);
        const price = parsePrice(p.price);
        const originalPrice = parsePrice(p.original_price);

        const data = {
            name: p.name,
            slug: productSlug,
            price: price,
            original_price: originalPrice || null,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=700&q=80",
            images: [],
            category_id: category.id,
            description: p.description || '',
            features: p.features || [],
            specs: p.specs || [],
            in_stock: true,
            is_new: true,
            stock_quantity: 50,
        };

        const existing = await prisma.product.findUnique({ where: { slug: productSlug } });
        if (existing) {
            await prisma.product.update({
                where: { slug: productSlug },
                data
            });
            console.log(`  ${i + 1}. UPDATED: ${p.name}  (${p.specs.length} specs, ${p.features.length} features)`);
        } else {
            await prisma.product.create({ data });
            console.log(`  ${i + 1}. INSERTED: ${p.name}  (${p.specs.length} specs, ${p.features.length} features)`);
        }
    }

    console.log("\n✅ All products seeded successfully with correct specifications!");
}

seed().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
