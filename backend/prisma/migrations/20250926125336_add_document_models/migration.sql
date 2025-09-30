/*
  Warnings:

  - You are about to alter the column `statut` on the `pay_runs` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - Added the required column `periode_paie_id` to the `pay_runs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pay_runs` ADD COLUMN `periode_paie_id` INTEGER NOT NULL,
    MODIFY `statut` ENUM('BROUILLON', 'EN_COURS', 'EN_ATTENTE_APPROBATION', 'APPROUVE', 'REJETE', 'COMPLETE', 'ANNULE') NOT NULL DEFAULT 'BROUILLON';

-- CreateTable
CREATE TABLE `documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(191) NOT NULL,
    `titre` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `chemin_fichier` VARCHAR(191) NOT NULL,
    `taille_fichier` INTEGER NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `metadata` JSON NULL,
    `tags` TEXT NOT NULL,
    `employe_id` INTEGER NOT NULL,
    `uploade_par` INTEGER NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifie_le` DATETIME(3) NOT NULL,

    INDEX `documents_employe_id_type_idx`(`employe_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modeles_document` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(191) NOT NULL,
    `contenu` TEXT NOT NULL,
    `variables` JSON NOT NULL,
    `est_actif` BOOLEAN NOT NULL DEFAULT true,
    `entreprise_id` INTEGER NOT NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `cree_par` INTEGER NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifie_le` DATETIME(3) NOT NULL,

    INDEX `modeles_document_entreprise_id_type_est_actif_idx`(`entreprise_id`, `type`, `est_actif`),
    UNIQUE INDEX `modeles_document_entreprise_id_nom_version_key`(`entreprise_id`, `nom`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `periodes_paie` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `date_debut` DATETIME(3) NOT NULL,
    `date_fin` DATETIME(3) NOT NULL,
    `est_cloturee` BOOLEAN NOT NULL DEFAULT false,
    `date_reglement` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `metadata` JSON NULL,
    `entreprise_id` INTEGER NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifie_le` DATETIME(3) NOT NULL,

    INDEX `periodes_paie_entreprise_id_est_cloturee_idx`(`entreprise_id`, `est_cloturee`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `configurations_paie` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entreprise_id` INTEGER NOT NULL,
    `jour_paie` INTEGER NOT NULL,
    `periode_calcul` VARCHAR(191) NOT NULL,
    `regle_arrondi` VARCHAR(191) NOT NULL,
    `devise_secondaire` VARCHAR(191) NULL,
    `taux_change` DECIMAL(10, 4) NULL,
    `format_numeration` JSON NOT NULL,
    `regle_validation` JSON NOT NULL,
    `parametres_calcul` JSON NOT NULL,
    `modifie_le` DATETIME(3) NOT NULL,

    UNIQUE INDEX `configurations_paie_entreprise_id_key`(`entreprise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `historique_salaires` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employe_id` INTEGER NOT NULL,
    `ancien_salaire` DECIMAL(10, 2) NOT NULL,
    `nouveau_salaire` DECIMAL(10, 2) NOT NULL,
    `date_effet` DATETIME(3) NOT NULL,
    `motif` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `documents` JSON NULL,
    `modifie_par` INTEGER NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `historique_salaires_employe_id_date_effet_idx`(`employe_id`, `date_effet`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regles_deduction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(191) NOT NULL,
    `formule` TEXT NOT NULL,
    `conditionsApplication` JSON NOT NULL,
    `est_obligatoire` BOOLEAN NOT NULL DEFAULT false,
    `ordre` INTEGER NOT NULL,
    `configuration_id` INTEGER NOT NULL,
    `est_actif` BOOLEAN NOT NULL DEFAULT true,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifie_le` DATETIME(3) NOT NULL,

    INDEX `regles_deduction_configuration_id_est_actif_idx`(`configuration_id`, `est_actif`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `bulletins_statut_paiement_idx` ON `bulletins`(`statut_paiement`);

-- CreateIndex
CREATE INDEX `employees_status_idx` ON `employees`(`status`);

-- CreateIndex
CREATE INDEX `pay_runs_entreprise_id_statut_idx` ON `pay_runs`(`entreprise_id`, `statut`);

-- AddForeignKey
ALTER TABLE `pay_runs` ADD CONSTRAINT `pay_runs_periode_paie_id_fkey` FOREIGN KEY (`periode_paie_id`) REFERENCES `periodes_paie`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_employe_id_fkey` FOREIGN KEY (`employe_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `documents` ADD CONSTRAINT `documents_uploade_par_fkey` FOREIGN KEY (`uploade_par`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modeles_document` ADD CONSTRAINT `modeles_document_entreprise_id_fkey` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `modeles_document` ADD CONSTRAINT `modeles_document_cree_par_fkey` FOREIGN KEY (`cree_par`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `periodes_paie` ADD CONSTRAINT `periodes_paie_entreprise_id_fkey` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `configurations_paie` ADD CONSTRAINT `configurations_paie_entreprise_id_fkey` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historique_salaires` ADD CONSTRAINT `historique_salaires_employe_id_fkey` FOREIGN KEY (`employe_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historique_salaires` ADD CONSTRAINT `historique_salaires_modifie_par_fkey` FOREIGN KEY (`modifie_par`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regles_deduction` ADD CONSTRAINT `regles_deduction_configuration_id_fkey` FOREIGN KEY (`configuration_id`) REFERENCES `configurations_paie`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `bulletins` RENAME INDEX `bulletins_employe_id_fkey` TO `bulletins_employe_id_idx`;

-- RenameIndex
ALTER TABLE `bulletins` RENAME INDEX `bulletins_pay_run_id_fkey` TO `bulletins_pay_run_id_idx`;

-- RenameIndex
ALTER TABLE `employees` RENAME INDEX `employees_entreprise_id_fkey` TO `employees_entreprise_id_idx`;

-- RenameIndex
ALTER TABLE `pay_runs` RENAME INDEX `pay_runs_cree_par_fkey` TO `pay_runs_cree_par_idx`;
