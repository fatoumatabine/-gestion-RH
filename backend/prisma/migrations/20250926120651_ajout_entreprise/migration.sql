/*
  Warnings:

  - Added the required column `entreprise_id` to the `employees` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `employees` ADD COLUMN `entreprise_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `entreprises` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `adresse` TEXT NULL,
    `telephone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `site_web` VARCHAR(191) NULL,
    `logo` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifie_le` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_entreprise_id_fkey` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
