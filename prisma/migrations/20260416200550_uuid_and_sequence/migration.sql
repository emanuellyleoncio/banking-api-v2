/*
  Warnings:

  - The primary key for the `accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `accounts` table. All the data in the column will be lost.
  - The required column `account_id` was added to the `accounts` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
CREATE SEQUENCE IF NOT EXISTS account_number_seq START 1001 INCREMENT 1;

-- DropForeignKey
ALTER TABLE "deposits" DROP CONSTRAINT "deposits_account_id_fkey";

-- DropForeignKey
ALTER TABLE "transfers" DROP CONSTRAINT "transfers_destination_id_fkey";

-- DropForeignKey
ALTER TABLE "transfers" DROP CONSTRAINT "transfers_origin_id_fkey";

-- DropForeignKey
ALTER TABLE "withdrawals" DROP CONSTRAINT "withdrawals_account_id_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_pkey",
DROP COLUMN "id",
ADD COLUMN     "account_id" TEXT NOT NULL,
ALTER COLUMN "number" SET DEFAULT nextval('account_number_seq'),
ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("account_id");

-- AlterTable
ALTER TABLE "deposits" ALTER COLUMN "account_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "transfers" ALTER COLUMN "origin_id" SET DATA TYPE TEXT,
ALTER COLUMN "destination_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "withdrawals" ALTER COLUMN "account_id" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "accounts_created_at_idx" ON "accounts"("created_at");

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_origin_id_fkey" FOREIGN KEY ("origin_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_destination_id_fkey" FOREIGN KEY ("destination_id") REFERENCES "accounts"("account_id") ON DELETE RESTRICT ON UPDATE CASCADE;
