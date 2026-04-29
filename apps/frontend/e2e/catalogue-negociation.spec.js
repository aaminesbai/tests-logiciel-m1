import { expect, test } from "@playwright/test";

const users = [
  {
    id: 1,
    email: "test@poketrade.dev",
    username: "Alice",
    cards: [
      {
        id: 1,
        cardId: "swsh3-136",
        name: "Furret",
        image: "furret.webp",
        rarity: "Uncommon",
        setName: "Darkness Ablaze",
        types: "Colorless",
        ownerId: 1,
      },
      {
        id: 2,
        cardId: "swsh3-24",
        name: "Centiskorch",
        image: "centiskorch.webp",
        rarity: "Rare",
        setName: "Darkness Ablaze",
        types: "Fire",
        ownerId: 1,
      },
    ],
  },
  {
    id: 2,
    email: "bruno@poketrade.dev",
    username: "Bruno",
    cards: [
      {
        id: 3,
        cardId: "swsh3-44",
        name: "Suicune",
        image: "suicune.webp",
        rarity: "Rare",
        setName: "Darkness Ablaze",
        types: "Water",
        ownerId: 2,
      },
    ],
  },
  {
    id: 3,
    email: "claire@poketrade.dev",
    username: "Claire",
    cards: [
      {
        id: 4,
        cardId: "swsh3-170",
        name: "Capture Energy",
        image: "energy.webp",
        rarity: "Uncommon",
        setName: "Darkness Ablaze",
        types: "Energy",
        ownerId: 3,
      },
    ],
  },
];

const makeTrade = (overrides = {}) => ({
  id: 1,
  createdAt: "2026-02-26T10:30:00.000Z",
  status: "PENDING",
  message: "Salut, je te propose Furret contre Suicune.",
  senderId: 1,
  receiverId: 2,
  sender: users[0],
  receiver: users[1],
  senderCards: [users[0].cards[0]],
  receiverCards: [users[1].cards[0]],
  comments: [
    {
      id: 1,
      content: "Salut, je te propose Furret contre Suicune.",
      createdAt: "2026-02-26T10:30:00.000Z",
      transactionId: 1,
    },
  ],
  ...overrides,
});

test.beforeEach(async ({ page }) => {
  let activeTrade = makeTrade();
  let nextTradeId = 2;
  let nextCommentId = 2;

  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = request.url();

    if (url.includes("unsplash.com") || url.endsWith(".webp")) {
      await route.fulfill({ status: 200, body: "" });
      return;
    }

    if (url.endsWith("/catalog/users")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(users),
      });
      return;
    }

    if (url.match(/\/catalog\/users\/\d+$/)) {
      const id = Number(url.split("/").at(-1));
      const user = users.find((entry) => entry.id === id);
      await route.fulfill({
        status: user ? 200 : 404,
        contentType: "application/json",
        body: JSON.stringify(user || { message: "Not found" }),
      });
      return;
    }

    if (url.endsWith("/auth/login")) {
      const body = request.postDataJSON();
      const valid = body.email === "test@poketrade.dev" && body.password === "test";
      await route.fulfill({
        status: valid ? 201 : 401,
        contentType: "application/json",
        body: JSON.stringify(valid ? users[0] : { message: "Invalid email or password" }),
      });
      return;
    }

    if (url.endsWith("/negotiations") && request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([activeTrade]),
      });
      return;
    }

    if (url.endsWith("/negotiations") && request.method() === "POST") {
      const body = request.postDataJSON();
      activeTrade = makeTrade({
        id: nextTradeId++,
        message: body.message,
        senderId: body.senderId,
        receiverId: body.receiverId,
        senderCards: users.flatMap((user) => user.cards).filter((card) => body.senderCardIds.includes(card.id)),
        receiverCards: users.flatMap((user) => user.cards).filter((card) => body.receiverCardIds.includes(card.id)),
        comments: [],
      });
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(activeTrade),
      });
      return;
    }

    if (url.match(/\/negotiations\/\d+$/) && request.method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(activeTrade),
      });
      return;
    }

    if (url.endsWith("/negotiations/1/comments")) {
      const body = request.postDataJSON();
      const content = body.content.trim();
      if (content) {
        activeTrade = {
          ...activeTrade,
          comments: [
            ...activeTrade.comments,
            {
              id: nextCommentId++,
              content,
              createdAt: "2026-02-26T10:45:00.000Z",
              transactionId: 1,
            },
          ],
        };
      }
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(activeTrade),
      });
      return;
    }

    if (url.endsWith("/negotiations/1/accept")) {
      activeTrade = { ...activeTrade, status: "ACCEPTED" };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(activeTrade),
      });
      return;
    }

    if (url.endsWith("/negotiations/1/refuse")) {
      activeTrade = { ...activeTrade, status: "REFUSED" };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(activeTrade),
      });
      return;
    }

    await route.continue();
  });
});

test("parcourt le catalogue puis ouvre un profil avec ses cartes", async ({ page }) => {
  await page.goto("/users");

  await expect(page.getByRole("heading", { name: "Utilisateurs" })).toBeVisible();
  await expect(page.getByText("Paris")).toBeVisible();
  await expect(page.getByText("Lyon")).toBeVisible();
  await expect(page.getByText("Marseille")).toBeVisible();

  await page.getByRole("link", { name: "Voir profil" }).first().click();

  await expect(page).toHaveURL(/\/profile\/1$/);
  await expect(page.getByRole("heading", { name: "Cartes disponibles" })).toBeVisible();
  await expect(page.getByText("2 objets")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Furret" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Centiskorch" })).toBeVisible();
});

test("masque les zones connectees et redirige vers la connexion si besoin", async ({ page }) => {
  await page.goto("/users");

  await expect(page.getByRole("link", { name: "Mon profil" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Echange" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Connexion" }).first()).toBeVisible();

  await page.goto("/profile/me");
  await expect(page).toHaveURL(/\/auth$/);
});

test("connecte le user de test et rend le profil dynamique", async ({ page }) => {
  await page.goto("/auth");

  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page).toHaveURL(/\/profile\/me$/);
  await expect(page.getByRole("heading", { name: "Alice" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Mon profil" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Echange" })).toBeVisible();
});

test("refuse une connexion invalide", async ({ page }) => {
  await page.goto("/auth");

  await page.getByLabel("Mot de passe").fill("bad");
  await page.getByRole("button", { name: "Se connecter" }).click();

  await expect(page.getByText("Email ou mot de passe invalide.")).toBeVisible();
});

test("affiche une negotiation existante et permet de changer son statut", async ({ page }) => {
  await page.goto("/auth");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.goto("/trade/1");

  await expect(page.getByRole("heading", { name: "Echange & Negociation" })).toBeVisible();
  await expect(page.getByText("Statut: pending")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Furret" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Suicune" }).first()).toBeVisible();

  await page.getByRole("button", { name: "Accepter" }).click();
  await expect(page.getByText("Statut: accepted")).toBeVisible();

  await page.getByRole("button", { name: "Refuser" }).click();
  await expect(page.getByText("Statut: refused")).toBeVisible();
});

test("ajoute un message de negotiation et bloque les messages vides", async ({ page }) => {
  await page.goto("/auth");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.goto("/trade/1");

  await expect(page.getByRole("button", { name: "Envoyer", exact: true })).toBeDisabled();

  await page.getByPlaceholder("Repondre avec un commentaire").fill("Nouveau commentaire de test");
  await page.getByRole("button", { name: "Envoyer", exact: true }).click();

  await expect(page.getByText("Nouveau commentaire de test")).toBeVisible();
  await expect(page.getByPlaceholder("Repondre avec un commentaire")).toHaveValue("");
});

test("bloque une proposition incomplete puis cree une proposition valide", async ({ page }) => {
  await page.goto("/auth");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await page.goto("/trade/1");

  await page.getByPlaceholder("Message pour cette proposition").fill("Je propose un echange incomplet");
  await expect(page.getByRole("button", { name: "Envoyer proposition" })).toBeDisabled();

  const selectors = page.getByRole("button", { name: "Selectionner" });
  await selectors.nth(0).click();
  await selectors.nth(1).click();
  await page.getByPlaceholder("Message pour cette proposition").fill("Furret contre Suicune");
  await page.getByRole("button", { name: "Envoyer proposition" }).click();

  await expect(page.getByPlaceholder("Message pour cette proposition")).toHaveValue(/Nouvelle proposition creee/);
  await expect(page.getByRole("button", { name: "Retirer" })).toHaveCount(0);
});
