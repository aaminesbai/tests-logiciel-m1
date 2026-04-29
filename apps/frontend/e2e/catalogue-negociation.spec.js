import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = route.request().url();

    if (url.includes("tcgdex") || url.includes("/cards/")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ image: null }),
      });
      return;
    }

    await route.continue();
  });
});

test("parcourt le catalogue des utilisateurs puis ouvre un profil avec ses cartes", async ({ page }) => {
  await page.goto("/users");

  await expect(page.getByRole("heading", { name: "Utilisateurs" })).toBeVisible();
  await expect(page.getByText("Paris")).toBeVisible();
  await expect(page.getByText("Lyon")).toBeVisible();
  await expect(page.getByText("Marseille")).toBeVisible();

  await page.getByRole("link", { name: "Voir profil" }).first().click();

  await expect(page).toHaveURL(/\/profile\/u1$/);
  await expect(page.getByRole("heading", { name: "Cartes disponibles" })).toBeVisible();
  await expect(page.getByText("2 objets")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Furret" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Centiskorch" })).toBeVisible();
});

test("gere le cas extreme d'un profil inconnu en affichant un profil de repli", async ({ page }) => {
  await page.goto("/profile/utilisateur-inconnu");

  await expect(page.getByText("test@poketrade.dev - Paris")).toBeVisible();
  await expect(page.getByText("2 objets")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Furret" })).toBeVisible();
});

test("affiche une negotiation existante et permet de changer son statut", async ({ page }) => {
  await page.goto("/trade/t1");

  await expect(page.getByRole("heading", { name: "Echange & Negociation" })).toBeVisible();
  await expect(page.getByText("Statut: pending")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Objets proposes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Objets demandes" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Furret" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Suicune" }).first()).toBeVisible();

  await page.getByRole("button", { name: "Accepter" }).click();
  await expect(page.getByText("Statut: accepted")).toBeVisible();

  await page.getByRole("button", { name: "Refuser" }).click();
  await expect(page.getByText("Statut: refused")).toBeVisible();
});

test("ajoute un message de negotiation et ignore les messages vides", async ({ page }) => {
  await page.goto("/trade/t1");

  await page.getByRole("button", { name: "Envoyer", exact: true }).click();
  await expect(page.getByText("Nouveau commentaire de test")).toHaveCount(0);

  await page.getByPlaceholder("Repondre avec un commentaire").fill("Nouveau commentaire de test");
  await page.getByRole("button", { name: "Envoyer", exact: true }).click();

  await expect(page.getByText("Nouveau commentaire de test")).toBeVisible();
  await expect(page.getByPlaceholder("Repondre avec un commentaire")).toHaveValue("");
});

test("bloque une proposition incomplete puis cree une proposition valide", async ({ page }) => {
  await page.goto("/trade/t1");

  await page.getByPlaceholder("Message pour cette proposition").fill("Je propose un echange incomplet");
  await page.getByRole("button", { name: "Envoyer proposition" }).click();
  await expect(page.getByPlaceholder("Message pour cette proposition")).toHaveValue("Je propose un echange incomplet");
  await expect(page.getByText(/Nouvelle proposition creee/)).toHaveCount(0);

  const selectors = page.getByRole("button", { name: "Selectionner" });
  await selectors.nth(0).click();
  await selectors.nth(1).click();
  await page.getByPlaceholder("Message pour cette proposition").fill("Furret contre Suicune");
  await page.getByRole("button", { name: "Envoyer proposition" }).click();

  await expect(page.getByPlaceholder("Message pour cette proposition")).toHaveValue(/Nouvelle proposition creee/);
  await expect(page.getByRole("button", { name: "Retirer" })).toHaveCount(0);
});
