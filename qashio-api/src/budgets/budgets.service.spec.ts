import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { Budget } from '../entities/budget.entity';
import { Transaction } from '../entities/transaction.entity';
import { Category } from '../entities/category.entity';

const USER_ID = 'user-1';

describe('BudgetsService', () => {
  let service: BudgetsService;

  const mockBudget = {
    id: 'budget-1',
    amount: 500,
    period: 'monthly' as const,
    categoryId: 'cat-1',
    userId: USER_ID,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-31'),
    createdAt: new Date(),
    category: { id: 'cat-1', name: 'Utilities' },
  };

  const mockCategory = { id: 'cat-1', name: 'Utilities', userId: USER_ID };

  const mockBudgetRepo = {
    create: jest.fn().mockReturnValue(mockBudget),
    save: jest.fn().mockResolvedValue(mockBudget),
    find: jest.fn().mockResolvedValue([mockBudget]),
    findOne: jest.fn().mockResolvedValue(mockBudget),
    remove: jest.fn(),
  };

  const mockTransactionRepo = {
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ total: '150' }),
    })),
  };

  const mockCategoryRepo = {
    findOne: jest.fn().mockResolvedValue(mockCategory),
  };

  beforeEach(async () => {
    mockBudgetRepo.findOne.mockResolvedValue(mockBudget);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        { provide: getRepositoryToken(Budget), useValue: mockBudgetRepo },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepo,
        },
        { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a budget', async () => {
    const dto = {
      amount: 500,
      period: 'monthly' as const,
      categoryId: 'cat-1',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
    };
    const result = await service.create(dto, USER_ID);
    expect(result).toEqual(mockBudget);
    expect(mockBudgetRepo.create).toHaveBeenCalled();
    expect(mockBudgetRepo.save).toHaveBeenCalled();
  });

  it('should find all budgets', async () => {
    const result = await service.findAll(USER_ID);
    expect(result).toEqual([mockBudget]);
    expect(mockBudgetRepo.find).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });
  });

  it('should get budget usage', async () => {
    const result = await service.getBudgetUsage('budget-1', USER_ID);
    expect(result).toBeDefined();
    expect(result?.spent).toBe(150);
    expect(result?.remaining).toBe(350);
  });

  it('should update a budget', async () => {
    const result = await service.update('budget-1', { amount: 600 }, USER_ID);
    expect(result).toBeDefined();
    expect(mockBudgetRepo.save).toHaveBeenCalled();
  });

  it('should remove a budget', async () => {
    const result = await service.remove('budget-1', USER_ID);
    expect(result).toEqual({ deleted: true });
    expect(mockBudgetRepo.remove).toHaveBeenCalled();
  });

  it('should throw NotFoundException when budget not found for update', async () => {
    mockBudgetRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.update('bad-id', { amount: 100 }, USER_ID),
    ).rejects.toThrow(NotFoundException);
  });
});
