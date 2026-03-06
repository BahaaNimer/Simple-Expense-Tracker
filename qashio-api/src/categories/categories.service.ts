import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Transaction } from '../entities/transaction.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

export interface CategoryWithCount extends Category {
  transactionCount: number;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async create(dto: CreateCategoryDto, userId: string) {
    const category = this.categoryRepo.create({ ...dto, userId });
    return this.categoryRepo.save(category);
  }

  async findAll(userId: string): Promise<CategoryWithCount[]> {
    const categories = await this.categoryRepo.find({
      where: { userId },
      order: { name: 'ASC' },
    });
    if (categories.length === 0) return [];

    const counts = await this.transactionRepo
      .createQueryBuilder('t')
      .select('t.categoryId', 'categoryId')
      .addSelect('COUNT(*)', 'count')
      .where('t.userId = :userId', { userId })
      .groupBy('t.categoryId')
      .getRawMany<{ categoryId: string; count: string }>();

    const countByCategoryId = new Map<string, number>();
    counts.forEach((row) =>
      countByCategoryId.set(row.categoryId, parseInt(row.count, 10)),
    );

    return categories.map((cat) => ({
      ...cat,
      transactionCount: countByCategoryId.get(cat.id) ?? 0,
    }));
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    if (category.userId !== userId)
      throw new NotFoundException('Category not found');
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async remove(id: string, userId: string) {
    const category = await this.categoryRepo.findOne({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    if (category.userId !== userId)
      throw new NotFoundException('Category not found');

    const count = await this.transactionRepo.count({
      where: { categoryId: id, userId },
    });
    if (count > 0) {
      throw new BadRequestException(
        `Category has ${count} transaction(s). Remove or reassign them before deleting.`,
      );
    }

    await this.categoryRepo.remove(category);
    return { deleted: true };
  }
}
