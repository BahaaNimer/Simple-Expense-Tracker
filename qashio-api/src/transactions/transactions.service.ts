import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Category } from '../entities/category.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(dto: CreateTransactionDto, userId: string) {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category || category.userId !== userId) {
      throw new BadRequestException(
        'Category not found or does not belong to you',
      );
    }
    const transaction = this.transactionRepo.create({
      ...dto,
      date: new Date(dto.date),
      status: dto.status || 'Active',
      userId,
    });
    const saved = await this.transactionRepo.save(transaction);
    await this.kafkaService.emitTransactionEvent('created', saved);
    return saved;
  }

  async findAll(query: QueryTransactionDto, userId: string) {
    const {
      search,
      referencePrefix,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      categoryId,
      type,
      status,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10,
    } = query;
    const qb = this.transactionRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.category', 'category')
      .andWhere('t.userId = :userId', { userId });

    if (search) {
      qb.andWhere(
        '(t.reference ILIKE :search OR t.counterparty ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (referencePrefix) {
      qb.andWhere('t.reference ILIKE :refPrefix', {
        refPrefix: `${referencePrefix}%`,
      });
    }
    if (minAmount != null) {
      qb.andWhere('t.amount >= :minAmount', { minAmount });
    }
    if (maxAmount != null) {
      qb.andWhere('t.amount <= :maxAmount', { maxAmount });
    }
    if (startDate) {
      qb.andWhere('t.date >= :startDate', { startDate });
    }
    if (endDate) {
      qb.andWhere('t.date <= :endDate', { endDate });
    }
    if (categoryId) {
      qb.andWhere('t.categoryId = :categoryId', { categoryId });
    }
    if (type) {
      qb.andWhere('t.type = :type', { type });
    }
    if (status) {
      qb.andWhere('t.status = :status', { status });
    }

    const validSortColumns = [
      'date',
      'reference',
      'counterparty',
      'amount',
      'status',
    ];
    const order = (sortOrder || 'asc').toUpperCase() as 'ASC' | 'DESC';
    if (sortBy && validSortColumns.includes(sortBy)) {
      qb.orderBy(`t.${sortBy}`, order);
    } else {
      qb.orderBy('t.date', 'DESC');
    }

    const total = await qb.getCount();
    const data = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Returns distinct reference prefixes (part before first hyphen, or full reference) for the user's transactions. */
  async getReferencePrefixes(userId: string): Promise<string[]> {
    const rows = await this.transactionRepo
      .createQueryBuilder('t')
      .select('t.reference', 'ref')
      .where('t.userId = :userId', { userId })
      .distinct(true)
      .getRawMany();
    const prefixes = new Set<string>();
    for (const row of rows) {
      const ref = (row as { ref?: string }).ref ?? '';
      const prefix = ref.includes('-') ? ref.split('-')[0].trim() : ref.trim();
      if (prefix) prefixes.add(prefix);
    }
    return Array.from(prefixes).sort();
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.transactionRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }
    if (transaction.userId !== userId) {
      throw new NotFoundException(`Transaction ${id} not found`);
    }
    return transaction;
  }

  async update(id: string, dto: UpdateTransactionDto, userId: string) {
    const transaction = await this.findOne(id, userId);
    Object.assign(transaction, {
      ...dto,
      ...(dto.date && { date: new Date(dto.date) }),
    });
    const updated = await this.transactionRepo.save(transaction);
    await this.kafkaService.emitTransactionEvent('updated', updated);
    return updated;
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);
    await this.transactionRepo.remove(transaction);
    return { deleted: true };
  }

  async getSummary(startDate: string, endDate: string, userId: string) {
    const qb = this.transactionRepo.createQueryBuilder('t');
    qb.select('t.type', 'type')
      .addSelect('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.userId = :userId', { userId })
      .andWhere('t.date >= :startDate', { startDate })
      .andWhere('t.date <= :endDate', { endDate })
      .groupBy('t.type');

    const results = await qb.getRawMany<{ type: string; total: string }>();
    const incomeStr = results.find((r) => r.type === 'income')?.total ?? '0';
    const expenseStr = results.find((r) => r.type === 'expense')?.total ?? '0';
    const totalIncome = parseFloat(incomeStr);
    const totalExpense = parseFloat(expenseStr);

    return {
      startDate,
      endDate,
      totalIncome,
      totalExpense,
      net: totalIncome - totalExpense,
    };
  }
}
