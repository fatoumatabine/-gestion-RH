-- AlterTable
ALTER TABLE `employees` ADD COLUMN `contract_type` ENUM('FIXED_SALARY', 'DAILY', 'HOURLY') NOT NULL DEFAULT 'FIXED_SALARY',
    ADD COLUMN `daily_rate` DECIMAL(10, 2) NULL,
    ADD COLUMN `hourly_rate` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `entreprises` ADD COLUMN `couleur_dashboard` VARCHAR(191) NULL,
    ADD COLUMN `couleur_primaire` VARCHAR(191) NULL,
    ADD COLUMN `couleur_secondaire` VARCHAR(191) NULL;
