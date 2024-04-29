/*
  Warnings:

  - The values [price_1OYxkqFj9oKEERu1NbKUxXxN,price_1OYxkqFj9oKEERu1KfJGWxgN] on the enum `Subscription_plan` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `subscription` DROP FOREIGN KEY `Subscription_storeId_fkey`;

-- AlterTable
ALTER TABLE `subscription` MODIFY `plan` ENUM('PLN_n9u9ypf43pk6vti', 'PLN_4elei0drizjfiie') NULL;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_storeId_fkey` FOREIGN KEY (`storeId`) REFERENCES `Store`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
