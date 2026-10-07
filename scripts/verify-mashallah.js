const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.product.count({
    where: { store_id: '5e4838be-7384-4d1b-8766-3124a7bd60b0' }
  });
  console.log('Total Mashallah Store products:', count);

  const kids = await prisma.product.findFirst({
    where: { slug: 'mashallah-kids-suit-1' },
    include: { store: { include: { owner: true } } }
  });
  console.log('Kids Product Sample:', {
    name: kids.name,
    price: kids.price,
    store: kids.store?.name,
    phone: kids.store?.owner?.phone,
    sizes: kids.sizes,
    image: kids.image
  });

  const women = await prisma.product.findFirst({
    where: { slug: 'mashallah-women-suit-1' },
    include: { store: { include: { owner: true } } }
  });
  console.log('Women Product Sample:', {
    name: women.name,
    price: women.price,
    store: women.store?.name,
    phone: women.store?.owner?.phone,
    sizes: women.sizes,
    image: women.image
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
