const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('1. Checking existing categories...');
  const allCats = await prisma.category.findMany();
  console.log('Found categories:', allCats.map(c => ({ id: c.id, name: c.name, slug: c.slug })));

  // 2. Find or create 'Night Suits' category
  let nightSuitsCat = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: 'night-suits' },
        { name: 'Night Suits' }
      ]
    }
  });

  if (!nightSuitsCat) {
    nightSuitsCat = await prisma.category.create({
      data: {
        name: 'Night Suits',
        slug: 'night-suits',
        icon: 'Shirt',
        is_in_header: true,
        is_in_sidebar: true,
        sidebar_desc: 'Premium Kids and Women Loungewear & Night Suits Collection'
      }
    });
    console.log('✅ Created NEW category "Night Suits":', nightSuitsCat.id);
  } else {
    console.log('ℹ️ Found existing "Night Suits" category:', nightSuitsCat.id);
  }

  // 3. Find products to update (Mashallah Store products: kids & women nightwear)
  const storeId = '5e4838be-7384-4d1b-8766-3124a7bd60b0';
  const productsToUpdate = await prisma.product.findMany({
    where: {
      OR: [
        { store_id: storeId },
        { slug: { startsWith: 'mashallah-' } }
      ]
    },
    select: { id: true, name: true, slug: true, category_id: true }
  });

  console.log('Found ' + productsToUpdate.length + ' new Mashallah Store products to update.');

  // 4. Update products to Night Suits category
  const res = await prisma.product.updateMany({
    where: {
      OR: [
        { store_id: storeId },
        { slug: { startsWith: 'mashallah-' } }
      ]
    },
    data: {
      category_id: nightSuitsCat.id
    }
  });

  console.log('🎉 Successfully updated ' + res.count + ' products to category "Night Suits"!');

  // 5. Verification
  const sample = await prisma.product.findMany({
    where: { category_id: nightSuitsCat.id },
    take: 5,
    include: { category: true }
  });
  console.log('Sample updated products:', sample.map(p => ({
    name: p.name,
    category: p.category?.name,
    cat_id: p.category_id
  })));

  const countTotal = await prisma.product.count({
    where: { category_id: nightSuitsCat.id }
  });
  console.log('Total products now in Night Suits category:', countTotal);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
