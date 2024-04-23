/*
  Warnings:

  - The values [STORE_ADMIN] on the enum `Invitation_role` will be removed. If these variants are still used in the database, this will fail.
  - The values [STORE_ADMIN] on the enum `Invitation_role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `billboard` ADD COLUMN `isBanner` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `invitation` MODIFY `role` ENUM('STORE_OWNER', 'STAFF_USER') NOT NULL DEFAULT 'STAFF_USER';

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('STORE_OWNER', 'STAFF_USER') NOT NULL DEFAULT 'STAFF_USER';
