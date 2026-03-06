import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashed',
    isActive: true,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockReturnValue(mockUser),
      save: jest.fn().mockResolvedValue(mockUser),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('jwt-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new user', async () => {
    const result = await service.register({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result).toMatchObject({
      user: { id: mockUser.id, email: mockUser.email },
      access_token: 'jwt-token',
    });
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(userRepo.create).toHaveBeenCalled();
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('should throw ConflictException when email already exists', async () => {
    userRepo.findOne.mockResolvedValueOnce(mockUser);
    await expect(
      service.register({ email: 'test@example.com', password: 'password123' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should login with valid credentials', async () => {
    userRepo.findOne.mockResolvedValueOnce(mockUser);
    const result = await service.login({
      email: 'test@example.com',
      password: 'password',
    });
    expect(result).toMatchObject({
      user: { id: mockUser.id, email: mockUser.email },
      access_token: 'jwt-token',
    });
  });

  it('should throw UnauthorizedException when user not found', async () => {
    userRepo.findOne.mockResolvedValueOnce(null);
    await expect(
      service.login({ email: 'bad@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
