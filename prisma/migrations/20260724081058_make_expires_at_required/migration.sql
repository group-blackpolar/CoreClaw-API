/*
  Warnings:

  - Made the column `expiresAt` on table `accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `expiresAt` on table `api_keys` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "accounts" ALTER COLUMN "expiresAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "api_keys" ALTER COLUMN "expiresAt" SET NOT NULL;
