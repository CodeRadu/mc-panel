/*
  Warnings:

  - The primary key for the `Server` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Server` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Server" DROP CONSTRAINT "Server_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Server_pkey" PRIMARY KEY ("id");
