-- CreateTable
CREATE TABLE `pointages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employe_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `heure_arrivee` DATETIME(3) NULL,
    `heure_depart` DATETIME(3) NULL,
    `statut` ENUM('PRESENT', 'RETARD', 'DEPART_ANTICIPE', 'ABSENT', 'CONGE', 'MALADIE', 'AUTRE') NOT NULL DEFAULT 'PRESENT',
    `type_pointage` ENUM('NORMAL', 'RETARD_JUSTIFIE', 'DEPART_ANTICIPE_JUSTIFIE', 'HEURES_SUPPLEMENTAIRES', 'TRAVAIL_NUIT', 'FERIE') NOT NULL DEFAULT 'NORMAL',
    `commentaire` TEXT NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `ip_address` VARCHAR(191) NULL,
    `device_info` VARCHAR(191) NULL,
    `valide_par` INTEGER NULL,
    `date_validation` DATETIME(3) NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifie_le` DATETIME(3) NOT NULL,

    INDEX `pointages_employe_id_date_idx`(`employe_id`, `date`),
    INDEX `pointages_date_statut_idx`(`date`, `statut`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `regles_pointage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `entreprise_id` INTEGER NOT NULL,
    `heure_debut` VARCHAR(191) NOT NULL DEFAULT '08:00',
    `heure_fin` VARCHAR(191) NOT NULL DEFAULT '17:00',
    `tolerance_retard` INTEGER NOT NULL DEFAULT 15,
    `tolerance_depart` INTEGER NOT NULL DEFAULT 15,
    `jours_travail` JSON NOT NULL,
    `heures_par_jour` INTEGER NOT NULL DEFAULT 8,
    `heures_sup_autorise` BOOLEAN NOT NULL DEFAULT true,
    `seuil_heures_sup` INTEGER NOT NULL DEFAULT 48,
    `pause_dejeuner` INTEGER NOT NULL DEFAULT 60,
    `est_flexible` BOOLEAN NOT NULL DEFAULT false,
    `plage_horaire_min` VARCHAR(191) NULL,
    `plage_horaire_max` VARCHAR(191) NULL,
    `jours_feries` JSON NULL,
    `modifie_le` DATETIME(3) NOT NULL,

    UNIQUE INDEX `regles_pointage_entreprise_id_key`(`entreprise_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `absences` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employe_id` INTEGER NOT NULL,
    `type_absence` ENUM('CONGE_ANNUEL', 'CONGE_MALADIE', 'CONGE_MATERNITE', 'CONGE_PATERNITE', 'CONGE_EXCEPTIONNEL', 'ABSENCE_NON_JUSTIFIEE', 'ACCIDENT_TRAVAIL', 'FORMATION', 'AUTRE') NOT NULL,
    `date_debut` DATETIME(3) NOT NULL,
    `date_fin` DATETIME(3) NOT NULL,
    `motif` TEXT NULL,
    `statut` ENUM('EN_ATTENTE', 'APPROUVEE', 'REJETEE', 'ANNULEE') NOT NULL DEFAULT 'EN_ATTENTE',
    `jours_ouvres` INTEGER NOT NULL,
    `heures_absence` DECIMAL(5, 2) NOT NULL,
    `commentaire` TEXT NULL,
    `piece_jointe` VARCHAR(191) NULL,
    `approuve_par` INTEGER NULL,
    `date_approbation` DATETIME(3) NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifie_le` DATETIME(3) NOT NULL,

    INDEX `absences_employe_id_statut_idx`(`employe_id`, `statut`),
    INDEX `absences_date_debut_date_fin_idx`(`date_debut`, `date_fin`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pointages` ADD CONSTRAINT `pointages_employe_id_fkey` FOREIGN KEY (`employe_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pointages` ADD CONSTRAINT `pointages_valide_par_fkey` FOREIGN KEY (`valide_par`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `regles_pointage` ADD CONSTRAINT `regles_pointage_entreprise_id_fkey` FOREIGN KEY (`entreprise_id`) REFERENCES `entreprises`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absences` ADD CONSTRAINT `absences_employe_id_fkey` FOREIGN KEY (`employe_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absences` ADD CONSTRAINT `absences_approuve_par_fkey` FOREIGN KEY (`approuve_par`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
