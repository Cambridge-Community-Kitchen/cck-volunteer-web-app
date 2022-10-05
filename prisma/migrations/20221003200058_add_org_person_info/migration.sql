/*
  Warnings:

  - A unique constraint covering the columns `[id_person,id_organization]` on the table `organization_person` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `organization_person` ADD COLUMN `addl_info` JSON NULL;

-- CreateIndex
CREATE INDEX `id_person_idx` ON `organization_person`(`id_person`);

-- CreateIndex
CREATE INDEX `id_organization_idx` ON `organization_person`(`id_organization`);

-- CreateIndex
CREATE UNIQUE INDEX `organization_person_id_person_id_organization_key` ON `organization_person`(`id_person`, `id_organization`);

-- AddForeignKey
ALTER TABLE `organization_person` ADD CONSTRAINT `id_po_person` FOREIGN KEY (`id_person`) REFERENCES `person`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `organization_person` ADD CONSTRAINT `id_po_organization` FOREIGN KEY (`id_organization`) REFERENCES `organization`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
