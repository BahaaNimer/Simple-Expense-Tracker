import { DataSource } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Transaction } from '../entities/transaction.entity';
import { Budget } from '../entities/budget.entity';
import { DEFAULT_CATEGORIES, SEED_TRANSACTIONS } from './seed-data';

const SEED_USER_ID = process.env.SEED_USER_ID ?? null;

export async function runSeed(dataSource: DataSource) {
  if (!SEED_USER_ID) return;

  const categoryRepo = dataSource.getRepository(Category);
  const transactionRepo = dataSource.getRepository(Transaction);

  {
    await dataSource
      .createQueryBuilder()
      .update(Category)
      .set({ userId: SEED_USER_ID })
      .where('userId IS NULL')
      .execute();
    await dataSource
      .createQueryBuilder()
      .update(Transaction)
      .set({ userId: SEED_USER_ID })
      .where('userId IS NULL')
      .execute();
    await dataSource
      .createQueryBuilder()
      .update(Budget)
      .set({ userId: SEED_USER_ID })
      .where('userId IS NULL')
      .execute();
    console.log('Backfill: assigned unassigned rows to SEED_USER_ID');
  }

  const categoriesExist = await categoryRepo.count();
  if (categoriesExist === 0) {
    for (const name of DEFAULT_CATEGORIES) {
      await categoryRepo.save(
        categoryRepo.create({ name, userId: SEED_USER_ID }),
      );
    }
    console.log('Seeded default categories');
  }

  const categories = await categoryRepo.find({
    where: { userId: SEED_USER_ID },
  });
  const categoryByName = new Map(categories.map((c) => [c.name, c.id]));

  if ((await transactionRepo.count()) === 0) {
    for (const t of SEED_TRANSACTIONS) {
      const categoryId = categoryByName.get(t.category);
      if (!categoryId) continue;
      await transactionRepo.save(
        transactionRepo.create({
          amount: t.amount,
          date: new Date(t.date),
          type: 'expense',
          reference: t.reference,
          counterparty: t.counterparty,
          status: t.status,
          narration: t.narration,
          categoryId,
          userId: SEED_USER_ID,
        }),
      );
    }
    console.log(`Seeded ${SEED_TRANSACTIONS.length} transactions`);
  }
}
