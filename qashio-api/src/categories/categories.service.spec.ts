import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from '../entities/category.entity';
import { Transaction } from '../entities/transaction.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let createMock: jest.Mock;
  let saveMock: jest.Mock;
  let findMock: jest.Mock;
  let findOneMock: jest.Mock;

  const USER_ID = 'user-1';
  const mockCategory = {
    id: 'cat-1',
    name: 'Utilities',
    userId: USER_ID,
    createdAt: new Date(),
  };

  const mockTransactionRepo = {
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue([{ categoryId: 'cat-1', count: '2' }]),
    })),
    count: jest.fn().mockResolvedValue(0),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    createMock = jest.fn().mockReturnValue(mockCategory);
    saveMock = jest.fn().mockResolvedValue(mockCategory);
    findMock = jest.fn().mockResolvedValue([mockCategory]);
    findOneMock = jest.fn().mockResolvedValue(mockCategory);
    const mockRepository = {
      create: createMock,
      save: saveMock,
      find: findMock,
      findOne: findOneMock,
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getRepositoryToken(Category), useValue: mockRepository },
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockTransactionRepo,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a category', async () => {
    const result = await service.create({ name: 'Utilities' }, USER_ID);
    expect(result).toEqual(mockCategory);
    expect(createMock).toHaveBeenCalledWith({
      name: 'Utilities',
      userId: USER_ID,
    });
    expect(saveMock).toHaveBeenCalled();
  });

  it('should list all categories with transaction count', async () => {
    const result = await service.findAll(USER_ID);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ ...mockCategory, transactionCount: 2 });
    expect(findMock).toHaveBeenCalledWith({
      where: { userId: USER_ID },
      order: { name: 'ASC' },
    });
  });

  it('should remove category when no transactions', async () => {
    const result = await service.remove('cat-1', USER_ID);
    expect(result).toEqual({ deleted: true });
    expect(mockTransactionRepo.count).toHaveBeenCalledWith({
      where: { categoryId: 'cat-1', userId: USER_ID },
    });
  });

  it('should throw BadRequestException when category has transactions', async () => {
    mockTransactionRepo.count.mockResolvedValue(3);
    await expect(service.remove('cat-1', USER_ID)).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.remove('cat-1', USER_ID)).rejects.toThrow(
      /Remove or reassign them before deleting/,
    );
  });

  it('should update a category', async () => {
    const updated = { ...mockCategory, name: 'Updated' };
    saveMock.mockResolvedValueOnce(updated);
    const result = await service.update('cat-1', { name: 'Updated' }, USER_ID);
    expect(result).toMatchObject({ name: 'Updated' });
    expect(saveMock).toHaveBeenCalled();
  });

  it('should throw NotFoundException when removing non-existent category', async () => {
    findOneMock.mockResolvedValueOnce(null);
    await expect(service.remove('bad-id', USER_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw NotFoundException when updating non-existent category', async () => {
    findOneMock.mockResolvedValueOnce(null);
    await expect(
      service.update('bad-id', { name: 'New' }, USER_ID),
    ).rejects.toThrow(NotFoundException);
  });
});
