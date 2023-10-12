/*
  Warnings:

  - The primary key for the `AuthToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `AuthToken` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `token` to the `AuthToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuthToken" DROP CONSTRAINT "AuthToken_pkey",
ADD COLUMN     "token" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("id");
