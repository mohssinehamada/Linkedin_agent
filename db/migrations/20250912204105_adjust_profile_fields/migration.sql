/*
  Warnings:

  - You are about to drop the column `fullName` on the `CandidateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `preferences` on the `CandidateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `resumePath` on the `CandidateProfile` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `CandidateProfile` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `CandidateProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `CandidateProfile` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CandidateProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "location" TEXT,
    "linkedinUrl" TEXT,
    "portfolioUrl" TEXT,
    "resumeBytes" BLOB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_CandidateProfile" ("createdAt", "email", "id", "linkedinUrl", "location", "phone", "portfolioUrl", "updatedAt") SELECT "createdAt", "email", "id", "linkedinUrl", "location", "phone", "portfolioUrl", "updatedAt" FROM "CandidateProfile";
DROP TABLE "CandidateProfile";
ALTER TABLE "new_CandidateProfile" RENAME TO "CandidateProfile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
