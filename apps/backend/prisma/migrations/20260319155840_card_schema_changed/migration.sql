/*
  Warnings:

  - You are about to drop the column `category` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Card` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Card` table. All the data in the column will be lost.
  - Added the required column `cardId` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hp` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rarity` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setId` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `setName` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Added the required column `types` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Card" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cardId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "setName" TEXT NOT NULL,
    "hp" INTEGER NOT NULL,
    "types" TEXT NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "senderTransactionId" INTEGER,
    "receiverTransactionId" INTEGER,
    CONSTRAINT "Card_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Card_senderTransactionId_fkey" FOREIGN KEY ("senderTransactionId") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Card_receiverTransactionId_fkey" FOREIGN KEY ("receiverTransactionId") REFERENCES "Transaction" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Card" ("id", "ownerId", "receiverTransactionId", "senderTransactionId") SELECT "id", "ownerId", "receiverTransactionId", "senderTransactionId" FROM "Card";
DROP TABLE "Card";
ALTER TABLE "new_Card" RENAME TO "Card";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
