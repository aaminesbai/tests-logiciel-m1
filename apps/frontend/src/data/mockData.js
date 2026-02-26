export const users = [
  {
    id: "u1",
    name: "Test Test",
    email: "test@poketrade.dev",
    city: "Paris",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=320&q=80",
    bio: "Je collectionne surtout les cartes feu et dragon. J'echange mes doubles pour completer mes sets.",
  },
  {
    id: "u2",
    name: "Test Test",
    email: "test@poketrade.dev",
    city: "Lyon",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
    bio: "Fan des cartes vintage. Je cherche des cartes eau et electrik en reverse holo.",
  },
  {
    id: "u3",
    name: "Test Test",
    email: "test@poketrade.dev",
    city: "Marseille",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=320&q=80",
    bio: "Je complete des decks competitifs. Je propose beaucoup de cartes dresseur en double.",
  },
];

export const cardPool = [
  {
    id: "obj-1",
    tcgId: "swsh3-136",
    title: "Furret",
    description: "Carte en double issue du set Darkness Ablaze.",
    category: "Pokemon",
    ownerId: "u1",
  },
  {
    id: "obj-2",
    tcgId: "swsh3-24",
    title: "Centiskorch",
    description: "Bonne condition, protection sleeve incluse.",
    category: "Pokemon",
    ownerId: "u1",
  },
  {
    id: "obj-3",
    tcgId: "swsh3-44",
    title: "Suicune",
    description: "Cherche echange contre carte dragon equivalent.",
    category: "Pokemon",
    ownerId: "u2",
  },
  {
    id: "obj-4",
    tcgId: "swsh3-13",
    title: "Butterfree V",
    description: "Version standard, proche du neuf.",
    category: "Pokemon",
    ownerId: "u2",
  },
  {
    id: "obj-5",
    tcgId: "swsh3-146",
    title: "Piers",
    description: "Carte dresseur en double.",
    category: "Trainer",
    ownerId: "u3",
  },
  {
    id: "obj-6",
    tcgId: "swsh3-170",
    title: "Capture Energy",
    description: "Carte energie speciale.",
    category: "Energy",
    ownerId: "u3",
  },
];

export const tradeSeed = [
  {
    id: "t1",
    fromUserId: "u1",
    toUserId: "u2",
    offeredObjectIds: ["obj-1", "obj-2"],
    requestedObjectIds: ["obj-3"],
    status: "pending",
    createdAt: "2026-02-26T10:30:00.000Z",
    messages: [
      {
        id: "m1",
        authorId: "u1",
        text: "Salut, je te propose Furret + Centiskorch contre Suicune.",
        createdAt: "2026-02-26T10:30:00.000Z",
      },
      {
        id: "m2",
        authorId: "u2",
        text: "Interessant. Tu peux ajouter une carte energie ?",
        createdAt: "2026-02-26T10:41:00.000Z",
      },
    ],
  },
];
