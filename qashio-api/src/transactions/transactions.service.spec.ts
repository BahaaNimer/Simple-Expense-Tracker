import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
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
  });
});
