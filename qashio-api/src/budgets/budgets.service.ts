import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from '../entities/budget.entity';
import { Transaction } from '../entities/transaction.entity';
import { Category } from '../entities/category.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private readonly budgetRepo: Repository<Budget>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  /** Round to 2 decimal places to avoid floating-point storage/display issues. */
  private roundAmount(value: number): number {
    return Math.round(Number(value) * 100) / 100;
  }

  async create(dto: CreateBudgetDto, userId: string) {
    const category = await this.categoryRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category || category.userId !== userId) {
      throw new BadRequestException(
        'Category not found or does not belong to you',
      );
    }
    const budget = this.budgetRepo.create({
      ...dto,
      amount: this.roundAmount(dto.amount),
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      userId,
    });
    return this.budgetRepo.save(budget);
  }

  async update(id: string, dto: UpdateBudgetDto, userId: string) {
    const budget = await this.budgetRepo.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!budget) throw new NotFoundException('Budget not found');
    if (budget.userId !== userId)
      throw new NotFoundException('Budget not found');
    if (dto.amount != null) budget.amount = this.roundAmount(dto.amount);
    if (dto.period != null) budget.period = dto.period;
    if (dto.categoryId != null) budget.categoryId = dto.categoryId;
    if (dto.startDate != null) budget.startDate = new Date(dto.startDate);
    if (dto.endDate != null) budget.endDate = new Date(dto.endDate);
    return this.budgetRepo.save(budget);
  }

  async remove(id: string, userId: string) {
    const budget = await this.budgetRepo.findOne({ where: { id } });
    if (!budget) throw new NotFoundException('Budget not found');
    if (budget.userId !== userId)
      throw new NotFoundException('Budget not found');
    await this.budgetRepo.remove(budget);
    return { deleted: true };
  }

  async findAll(userId: string) {
    return this.budgetRepo.find({
      where: { userId },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  }

  async getBudgetUsage(budgetId: string, userId: string) {
    const budget = await this.budgetRepo.findOne({
      where: { id: budgetId },
      relations: ['category'],
    });
    if (!budget) return null;
    if (budget.userId !== userId) return null;

    const spending = await this.transactionRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.amount), 0)', 'total')
      .where('t.categoryId = :categoryId', { categoryId: budget.categoryId })
      .andWhere('t.userId = :userId', { userId })
      .andWhere('t.type = :type', { type: 'expense' })
      .andWhere('t.date >= :start', { start: budget.startDate })
      .andWhere('t.date <= :end', { end: budget.endDate })
      .getRawOne<{ total: string }>();

    const totalStr = spending?.total ?? '0';
    const spent = parseFloat(totalStr);
    const remaining = Number(budget.amount) - spent;

    return {
      budget,
      spent,
      remaining,
      percentageUsed:
        Number(budget.amount) > 0 ? (spent / Number(budget.amount)) * 100 : 0,
    };
  }
}
