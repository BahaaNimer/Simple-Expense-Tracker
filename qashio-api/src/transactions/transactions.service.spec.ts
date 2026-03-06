import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TransactionsService } from './transactions.service';
import { Transaction } from '../entities/transaction.entity';
import { Category } from '../entities/category.entity';
import { KafkaService } from '../kafka/kafka.service';

const USER_ID = 'user-1';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let transactionRepo: jest.Mocked<Repository<Transaction>>;
  let kafkaService: { emitTransactionEvent: jest.Mock };

  const mockTransaction = {
    id: 'uuid-1',
    amount: 100,
    date: new Date(),
    type: 'expense' as const,
    reference: 'REF-001',
    counterparty: 'Acme',
    status: 'Active' as const,
    categoryId: 'cat-1',
    userId: USER_ID,
    narration: 'Test',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategory = { id: 'cat-1', name: 'Utilities', userId: USER_ID };

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn().mockReturnValue(mockTransaction),
      save: jest.fn().mockResolvedValue(mockTransaction),
      findOne: jest.fn().mockResolvedValue(mockTransaction),
      createQueryBuilder: jest.fn(() => ({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockTransaction]),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ ref: 'REF-001' }]),
        groupBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(null),
      })),
      remove: jest.fn(),
    };

    const mockCategoryRepo = {
      findOne: jest.fn().mockResolvedValue(mockCategory),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepo,
        },
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepo,
        },
        {
          provide: KafkaService,
          useValue: {
            emitTransactionEvent: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    transactionRepo = module.get(getRepositoryToken(Transaction));
    kafkaService = module.get(KafkaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction and emit Kafka event', async () => {
      const dto = {
        amount: 100,
        date: '2025-04-27',
        type: 'expense' as const,
        reference: 'REF-001',
        counterparty: 'Acme',
        categoryId: 'cat-1',
      };
      const result = await service.create(dto, USER_ID);
      expect(result).toEqual(mockTransaction);
      expect(kafkaService.emitTransactionEvent).toHaveBeenCalledWith(
        'created',
        mockTransaction,
      );
    });

    it('should throw BadRequestException when category not found', async () => {
      const mockCategoryRepo = { findOne: jest.fn().mockResolvedValue(null) };
      const moduleRef = await Test.createTestingModule({
        providers: [
          TransactionsService,
          {
            provide: getRepositoryToken(Transaction),
            useValue: transactionRepo,
          },
          { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
          {
            provide: KafkaService,
            useValue: { emitTransactionEvent: jest.fn() },
          },
        ],
      }).compile();
      const svc = moduleRef.get(TransactionsService);
      await expect(
        svc.create(
          {
            amount: 100,
            date: '2025-04-27',
            type: 'expense',
            reference: 'REF-001',
            counterparty: 'Acme',
            categoryId: 'cat-1',
          },
          USER_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when category belongs to another user', async () => {
      const otherUserCategory = { ...mockCategory, userId: 'other-user' };
      const mockCategoryRepo = {
        findOne: jest.fn().mockResolvedValue(otherUserCategory),
      };
      const moduleRef = await Test.createTestingModule({
        providers: [
          TransactionsService,
          {
            provide: getRepositoryToken(Transaction),
            useValue: transactionRepo,
          },
          { provide: getRepositoryToken(Category), useValue: mockCategoryRepo },
          {
            provide: KafkaService,
            useValue: { emitTransactionEvent: jest.fn() },
          },
        ],
      }).compile();
      const svc = moduleRef.get(TransactionsService);
      await expect(
        svc.create(
          {
            amount: 100,
            date: '2025-04-27',
            type: 'expense',
            reference: 'REF-001',
            counterparty: 'Acme',
            categoryId: 'cat-1',
          },
          USER_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated data and pagination info', async () => {
      const qb = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(1),
        getMany: jest.fn().mockResolvedValue([mockTransaction]),
      };
      (transactionRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
      const result = await service.findAll({ page: 1, limit: 10 }, USER_ID);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockTransaction);
      expect(result.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
      expect(qb.getCount).toHaveBeenCalled();
      expect(qb.getMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return transaction when found and owned by user', async () => {
      const result = await service.findOne('uuid-1', USER_ID);
      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException when not found', async () => {
      (transactionRepo.findOne as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('invalid', USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when transaction belongs to another user', async () => {
      (transactionRepo.findOne as jest.Mock).mockResolvedValueOnce({
        ...mockTransaction,
        userId: 'other-user',
      });
      await expect(service.findOne('uuid-1', USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update transaction and emit Kafka event', async () => {
      const updated = { ...mockTransaction, amount: 200 };
      (transactionRepo.save as jest.Mock).mockResolvedValueOnce(updated);
      const result = await service.update(
        'uuid-1',
        { amount: 200 } as any,
        USER_ID,
      );
      expect(result).toEqual(updated);
      expect(kafkaService.emitTransactionEvent).toHaveBeenCalledWith(
        'updated',
        updated,
      );
    });
  });

  describe('remove', () => {
    it('should remove transaction and return deleted', async () => {
      const result = await service.remove('uuid-1', USER_ID);
      expect(result).toEqual({ deleted: true });
      expect(transactionRepo.remove).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe('getSummary', () => {
    it('should return totalIncome, totalExpense and net for date range', async () => {
      const qb = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { type: 'income', total: '300' },
          { type: 'expense', total: '150' },
        ]),
      };
      (transactionRepo.createQueryBuilder as jest.Mock).mockReturnValue(qb);
      const result = await service.getSummary(
        '2025-01-01',
        '2025-01-31',
        USER_ID,
      );
      expect(result).toEqual({
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        totalIncome: 300,
        totalExpense: 150,
        net: 150,
      });
    });
  });

  describe('getReferencePrefixes', () => {
    it('should return sorted distinct reference prefixes', async () => {
      (transactionRepo.createQueryBuilder as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ ref: 'INV1-1001' }, { ref: 'INV2-2002' }]),
      });
      const result = await service.getReferencePrefixes(USER_ID);
      expect(result).toEqual(['INV1', 'INV2']);
    });

    it('should return empty array when no transactions', async () => {
      (transactionRepo.createQueryBuilder as jest.Mock).mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      });
      const result = await service.getReferencePrefixes(USER_ID);
      expect(result).toEqual([]);
    });
  });
});
