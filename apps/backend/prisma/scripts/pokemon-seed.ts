import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

import TCGdex from '@tcgdex/sdk';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });
const tcgdex = new TCGdex('en');

const cardIds = [
  'xy12-1',
  'xy12-2',
  'xy1-1',
  'g1-1',
  'sm9-1',
  'sm10-1',
  'sm11-1',
  'sm12-1',
  'np-1',
  'np-2',
  'dp1-1',
  'dp5-1',
  'dp5-2',
  'si1-1',
  'pl4-1',
  'pl3-1',
  'base3-1',
  'base3-2',
  'gym1-1',
  'gym2-1',
  'col1-2',
  'col1-3',
  'hgss2-1',
  'pop5-2',
  'ecard1-1',
  'ecard2-1',
  'ex3-1',
  'ex4-3',
  'ex9-2',
  'dp6-1',
  'xy1-2',
  'g1-2',
  'sv07-001',
  'B1-002',
  'A1a-003',
  'dp4-3',
  'pop3-1',
  'pop9-1',
  'basep-3',
  'lc-2',
  'lc-3',
];

async function main() {
  for (const id of cardIds) {
    try {
      const card = await tcgdex.card.get(id);
      if (!card) continue;

      await prisma.card.create({
        data: {
          cardId: card.id,
          name: card.name,
          image: card.image ? card.image + '/high.webp' : '',
          rarity: card.rarity || 'Unknown',
          setId: card.set?.id || 'unknown',
          setName: card.set?.name || 'unknown',
          hp: card.hp || 0,
          types: card.types?.join(',') || '',
          ownerId: 1,
        },
      });

      console.log(`✅ Added ${card.name}`);
    } catch (err) {
      console.log(`❌ Error with ${id}`, err);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
