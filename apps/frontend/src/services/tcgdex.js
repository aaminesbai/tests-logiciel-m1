import TCGdex from "@tcgdex/sdk";

const tcgdex = new TCGdex("en");

export async function fetchCardsByIds(ids) {
  const uniqueIds = [...new Set(ids)].filter(Boolean);
  const cards = await Promise.all(
    uniqueIds.map(async (id) => {
      try {
        const card = await tcgdex.fetch("cards", id);
        return [id, card];
      } catch {
        return [id, null];
      }
    })
  );

  return Object.fromEntries(cards);
}
