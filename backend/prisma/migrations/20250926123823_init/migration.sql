-- AlterTable
ALTER TABLE `entreprises` ADD COLUMN `devise` VARCHAR(191) NOT NULL DEFAULT 'XOF',
    ADD COLUMN `est_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `parametres` JSON NULL,
    ADD COLUMN `periode_payroll` VARCHAR(191) NOT NULL DEFAULT 'MENSUEL',
    ADD COLUMN `timezone` VARCHAR(191) NOT NULL DEFAULT 'Africa/Dakar';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `last_login` DATETIME(3) NULL,
    ADD COLUMN `permissions` JSON NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `two_factor_enabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `two_factor_secret` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `pay_runs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference` VARCHAR(191) NOT NULL,
    `date_debut` DATETIME(3) NOT NULL,
    `date_fin` DATETIME(3) NOT NULL,
    `date_paiement` DATETIME(3) NOT NULL,
    `statut` VARCHAR(191) NOT NULL,
    `total_brut` DECIMAL(10, 2) NOT NULL,
    `total_net` DECIMAL(10, 2) NOT NULL,
    `total_deductions` DECIMAL(10, 2) NOT NULL,
    `nombre_employes` INTEGER NOT NULL,
    `metadata` JSON NULL,
    `entreprise_id` INTEGER NOT NULL,
    `cree_par` INTEGER NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approuve_le` DATETIME(3) NULL,
    `approuve_par` INTEGER NULL,

    UNIQUE INDEX `pay_runs_reference_key`(`reference`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bulletins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_bulletin` VARCHAR(191) NOT NULL,
    `date_paiement` DATETIME(3) NOT NULL,
    `jours_travailles` INTEGER NOT NULL,
    `heures_travaillees` INTEGER NOT NULL,
    `salaire_brut` DECIMAL(10, 2) NOT NULL,
    `salaire_base` DECIMAL(10, 2) NOT NULL,
    `montant_heures_supp` DECIMAL(10, 2) NOT NULL,
    `montant_bonus` DECIMAL(10, 2) NOT NULL,
    `indemnites` DECIMAL(10, 2) NOT NULL,
    `deductions` JSON NOT NULL,
    `total_deductions` DECIMAL(10, 2) NOT NULL,
    `salaire_net` DECIMAL(10, 2) NOT NULL,
    `montant_paye` DECIMAL(10, 2) NOT NULL,
    `reste_a_payer` DECIMAL(10, 2) NOT NULL,
    `statut_paiement` VARCHAR(191) NOT NULL,
    `chemin_pdf` VARCHAR(191) NULL,
    `calculs` JSON NULL,
    `est_verrouille` BOOLEAN NOT NULL DEFAULT false,
    `pay_run_id` INTEGER NOT NULL,
    `employe_id` INTEGER NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifie_le` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bulletins_numero_bulletin_key`(`numero_bulletin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paiements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference_transaction` VARCHAR(191) NOT NULL,
    `montant` DECIMAL(10, 2) NOT NULL,
    `methode_paiement` VARCHAR(191) NOT NULL,
    `reference_paiement` VARCHAR(191) NULL,
    `date_paiement` DATETIME(3) NOT NULL,
    `notes` TEXT NULL,
    `chemin_recu` VARCHAR(191) NULL,
    `statut` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `bulletin_id` INTEGER NOT NULL,
    `traite_par` INTEGER NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `paiements_reference_transaction_key`(`reference_transaction`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type_template` VARCHAR(191) NOT NULL,
    `nom` VARCHAR(191) NOT NULL,
    `contenu` TEXT NOT NULL,
    `variables` JSON NOT NULL,
    `est_defaut` BOOLEAN NOT NULL DEFAULT false,
    `est_actif` BOOLEAN NOT NULL DEFAULT true,
    `entreprise_id` INTEGER NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifie_le` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cle` VARCHAR(191) NOT NULL,
    `valeur` TEXT NOT NULL,
    `description` TEXT NULL,
    `type_data` VARCHAR(191) NOT NULL,
    `est_encrypte` BOOLEAN NOT NULL DEFAULT false,
    `entreprise_id` INTEGER NOT NULL,
    `modifie_le` DATETIME(3) NOT NULL,

    UNIQUE INDEX `settings_cle_entreprise_id_key`(`cle`, `entreprise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PayRunEmployees` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PayRunEmployees_AB_unique`(`A`, `B`),
    INDEX `_PayRunEmployees_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pay_runs` ADD CONSTRAINT `pay_runs_entreprise_id_fkey` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pay_runs` ADD CONSTRAINT `pay_runs_cree_par_fkey` FOREIGN KEY (`cree_par`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pay_runs` ADD CONSTRAINT `pay_runs_approuve_par_fkey` FOREIGN KEY (`approuve_par`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bulletins` ADD CONSTRAINT `bulletins_pay_run_id_fkey` FOREIGN KEY (`pay_run_id`) REFERENCES `pay_runs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bulletins` ADD CONSTRAINT `bulletins_employe_id_fkey` FOREIGN KEY (`employe_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paiements` ADD CONSTRAINT `paiements_bulletin_id_fkey` FOREIGN KEY (`bulletin_id`) REFERENCES `bulletins`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paiements` ADD CONSTRAINT `paiements_traite_par_fkey` FOREIGN KEY (`traite_par`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `templates` ADD CONSTRAINT `templates_entreprise_id_fkey` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `settings` ADD CONSTRAINT `settings_entreprise_id_fkey` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PayRunEmployees` ADD CONSTRAINT `_PayRunEmployees_A_fkey` FOREIGN KEY (`A`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PayRunEmployees` ADD CONSTRAINT `_PayRunEmployees_B_fkey` FOREIGN KEY (`B`) REFERENCES `pay_runs`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
