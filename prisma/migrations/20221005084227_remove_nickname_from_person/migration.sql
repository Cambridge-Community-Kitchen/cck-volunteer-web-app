/*
  Warnings:

  - You are about to drop the column `nickname` on the `person` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `nickname_UNIQUE` ON `person`;

-- AlterTable
ALTER TABLE `person` DROP COLUMN `nickname`;
