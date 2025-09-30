-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'CASHIER', 'EMPLOYEE') NOT NULL DEFAULT 'EMPLOYEE',
    `first_name` VARCHAR(191) NOT NULL,
    `last_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `employee_id` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NULL,
    `position` VARCHAR(191) NULL,
    `salary` DECIMAL(10, 2) NULL,
    `hire_date` DATETIME(3) NULL,
    `phone` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `employees_user_id_key`(`user_id`),
    UNIQUE INDEX `employees_employee_id_key`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `factures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id` INTEGER NOT NULL,
    `numero_facture` VARCHAR(191) NOT NULL,
    `montant` DECIMAL(10, 2) NOT NULL,
    `description` TEXT NULL,
    `statut` ENUM('EN_ATTENTE', 'PAYEE', 'ANNULEE') NOT NULL DEFAULT 'EN_ATTENTE',
    `date_echeance` DATETIME(3) NULL,
    `date_paiement` DATETIME(3) NULL,
    `cree_par` INTEGER NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `modifie_le` DATETIME(3) NOT NULL,

    UNIQUE INDEX `factures_numero_facture_key`(`numero_facture`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lignes_facture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `facture_id` INTEGER NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `quantite` INTEGER NOT NULL DEFAULT 1,
    `prix_unitaire` DECIMAL(10, 2) NOT NULL,
    `prix_total` DECIMAL(10, 2) NOT NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_audit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `utilisateur_id` INTEGER NULL,
    `action` VARCHAR(191) NOT NULL,
    `nom_table` VARCHAR(191) NOT NULL,
    `id_enregistrement` INTEGER NULL,
    `anciennes_valeurs` JSON NULL,
    `nouvelles_valeurs` JSON NULL,
    `cree_le` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures` ADD CONSTRAINT `factures_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `factures` ADD CONSTRAINT `factures_cree_par_fkey` FOREIGN KEY (`cree_par`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lignes_facture` ADD CONSTRAINT `lignes_facture_facture_id_fkey` FOREIGN KEY (`facture_id`) REFERENCES `factures`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `journal_audit` ADD CONSTRAINT `journal_audit_utilisateur_id_fkey` FOREIGN KEY (`utilisateur_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
