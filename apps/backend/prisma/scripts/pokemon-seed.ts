import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

const users = [
  {
    email: 'test@poketrade.dev',
    username: 'Alice',
    password: 'test',
  },
  {
    email: 'bruno@poketrade.dev',
    username: 'Bruno',
    password: 'demo',
  },
  {
    email: 'claire@poketrade.dev',
    username: 'Claire',
    password: 'demo',
  },
];

const cards = [
  {
    cardId: 'swsh3-136',
    name: 'Furret',
    image: 'https://assets.tcgdex.net/en/swsh/swsh3/136/high.webp',
    rarity: 'Uncommon',
    setId: 'swsh3',
    setName: 'Darkness Ablaze',
    hp: 110,
    types: 'Colorless',
    ownerEmail: 'test@poketrade.dev',
  },
  {
    cardId: 'swsh3-24',
    name: 'Blaziken',
    image: 'https://assets.tcgdex.net/en/swsh/swsh3/24/high.webp',
    rarity: 'Rare',
    setId: 'swsh3',
    setName: 'Darkness Ablaze',
    hp: 130,
    types: 'Fire',
    ownerEmail: 'test@poketrade.dev',
  },
  {
    cardId: 'swsh3-44',
    name: 'Darmanitan',
    image: 'https://assets.tcgdex.net/en/swsh/swsh3/44/high.webp',
    rarity: 'Rare',
    setId: 'swsh3',
    setName: 'Darkness Ablaze',
    hp: 110,
    types: 'Water',
    ownerEmail: 'bruno@poketrade.dev',
  },
  {
    cardId: 'swsh3-13',
    name: 'Decidueye',
    image: 'https://assets.tcgdex.net/en/swsh/swsh3/13/high.webp',
    rarity: 'Ultra Rare',
    setId: 'swsh3',
    setName: 'Darkness Ablaze',
    hp: 190,
    types: 'Grass',
    ownerEmail: 'bruno@poketrade.dev',
  },
  {
    cardId: 'swsh3-146',
    name: 'Staravia',
    image: 'https://assets.tcgdex.net/en/swsh/swsh3/146/high.webp',
    rarity: 'Uncommon',
    setId: 'swsh3',
    setName: 'Darkness Ablaze',
    hp: 80,
    types: 'Normal',
    ownerEmail: 'claire@poketrade.dev',
  },
  {
    cardId: 'swsh3-170',
    name: 'Spikemuth',
    image: 'https://assets.tcgdex.net/en/swsh/swsh3/170/high.webp',
    rarity: 'Uncommon',
    setId: 'swsh3',
    setName: 'Darkness Ablaze',
    hp: 0,
    types: 'Trainer',
    ownerEmail: 'claire@poketrade.dev',
  },
];

async function main() {
  await prisma.comment.deleteMany();
  await prisma.card.updateMany({
    data: {
      senderTransactionId: null,
      receiverTransactionId: null,
    },
  });
  await prisma.transaction.deleteMany();
  await prisma.card.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence WHERE name IN ('User', 'Card', 'Transaction', 'Comment')");

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  for (const card of cards) {
    const owner = await prisma.user.findUniqueOrThrow({
      where: { email: card.ownerEmail },
    });
    const { ownerEmail, ...data } = card;
    await prisma.card.create({
      data: {
        ...data,
        ownerId: owner.id,
      },
    });
  }

  const alice = await prisma.user.findUniqueOrThrow({
    where: { email: 'test@poketrade.dev' },
  });
  const bruno = await prisma.user.findUniqueOrThrow({
    where: { email: 'bruno@poketrade.dev' },
  });
  const furret = await prisma.card.findFirstOrThrow({ where: { cardId: 'swsh3-136' } });
  const centiskorch = await prisma.card.findFirstOrThrow({ where: { cardId: 'swsh3-24' } });
  const suicune = await prisma.card.findFirstOrThrow({ where: { cardId: 'swsh3-44' } });

  await prisma.transaction.create({
    data: {
      senderId: alice.id,
      receiverId: bruno.id,
      message: 'Salut, je te propose Furret + Blaziken contre Darmanitan.',
      senderCards: {
        connect: [{ id: furret.id }, { id: centiskorch.id }],
      },
      receiverCards: {
        connect: [{ id: suicune.id }],
      },
      comments: {
        create: [
          {
            content:
              'Salut, je te propose Furret + Blaziken contre Darmanitan.',
            userId: alice.id,
          },
          {
            content: 'Interessant. Tu peux ajouter une carte energie ?',
            userId: bruno.id,
          },
        ],
      },
    },
  });

  console.log('Seeded 3 users, 6 cards and 1 negotiation.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
