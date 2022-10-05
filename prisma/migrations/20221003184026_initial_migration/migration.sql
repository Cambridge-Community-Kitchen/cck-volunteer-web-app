-- CreateTable
CREATE TABLE `organization` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_ref` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,

    UNIQUE INDEX `id_ref_UNIQUE`(`id_ref`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_organization` INTEGER NOT NULL,
    `id_event_category` INTEGER NULL,
    `id_ref` VARCHAR(255) NULL,
    `start_date` TIMESTAMP(0) NOT NULL,
    `end_date` TIMESTAMP(0) NULL,
    `all_day` BOOLEAN NOT NULL DEFAULT true,
    `name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `addl_info` JSON NULL,

    INDEX `fk_organization_event_category_idx`(`id_event_category`),
    INDEX `fk_organization_idx`(`id_organization`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_organization` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `id_ref` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,

    INDEX `fk_organization_idx`(`id_organization`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_event` INTEGER NOT NULL,
    `general_volunteers_needed` INTEGER NOT NULL DEFAULT 0,
    `id_ref` VARCHAR(255) NULL,
    `name` VARCHAR(45) NOT NULL,
    `description` VARCHAR(255) NULL,

    INDEX `fk_event`(`id_event`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `event_position` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_event` INTEGER NOT NULL,
    `id_event_role` INTEGER NULL,
    `id_ref` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `description` VARCHAR(255) NULL,

    INDEX `fk_event_event_role_idx`(`id_event`),
    INDEX `fk_event_position_event_role_idx`(`id_event_role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `route` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_ref` VARCHAR(255) NULL,
    `id_event_position` INTEGER NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `passcode` VARCHAR(10) NULL,
    `distance` JSON NULL,

    INDEX `id_event_position`(`id_event_position`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `route_delivery` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_route` INTEGER NOT NULL,
    `portions` INTEGER NOT NULL,
    `name` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NOT NULL,
    `plus_code` VARCHAR(191) NOT NULL,
    `allergies` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `when_not_home` VARCHAR(191) NULL,
    `sequence` INTEGER NOT NULL,

    INDEX `id_route`(`id_route`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `person` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `totpsecret` VARCHAR(255) NOT NULL,
    `nickname` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `email_UNIQUE`(`email`),
    UNIQUE INDEX `totpsecret_UNIQUE`(`totpsecret`),
    UNIQUE INDEX `nickname_UNIQUE`(`nickname`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization_person` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_person` INTEGER NOT NULL,
    `id_organization` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `person_system_role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `id_person` INTEGER NOT NULL,
    `id_role` INTEGER NOT NULL,
    `id_organization` INTEGER NULL,

    INDEX `id_organization_idx`(`id_organization`),
    INDEX `id_person_idx`(`id_person`),
    INDEX `id_role_idx`(`id_role`),
    UNIQUE INDEX `person_system_role_id_person_id_role_id_organization_key`(`id_person`, `id_role`, `id_organization`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_role` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(45) NOT NULL,
    `description` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `role_UNIQUE`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `event` ADD CONSTRAINT `fk_organization_event_category` FOREIGN KEY (`id_event_category`) REFERENCES `event_category`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event` ADD CONSTRAINT `fk_organization_id` FOREIGN KEY (`id_organization`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event_category` ADD CONSTRAINT `fk_organization` FOREIGN KEY (`id_organization`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `event_role` ADD CONSTRAINT `fk_event` FOREIGN KEY (`id_event`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event_position` ADD CONSTRAINT `fk_event_event_role_idx` FOREIGN KEY (`id_event`) REFERENCES `event`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `event_position` ADD CONSTRAINT `fk_event_position_event_role_idx` FOREIGN KEY (`id_event_role`) REFERENCES `event_role`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `route` ADD CONSTRAINT `id_event_position` FOREIGN KEY (`id_event_position`) REFERENCES `event_position`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `route_delivery` ADD CONSTRAINT `id_route` FOREIGN KEY (`id_route`) REFERENCES `route`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `person_system_role` ADD CONSTRAINT `id_organization` FOREIGN KEY (`id_organization`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `person_system_role` ADD CONSTRAINT `id_person` FOREIGN KEY (`id_person`) REFERENCES `person`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `person_system_role` ADD CONSTRAINT `id_role` FOREIGN KEY (`id_role`) REFERENCES `system_role`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
