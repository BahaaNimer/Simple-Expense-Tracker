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

  it('should normalize email to lowercase on register', async () => {
    await service.register({
      email: '  User@Example.COM  ',
      password: 'password123',
    });
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
    });
    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'user@example.com' }),
    );
  });

  it('should normalize email to lowercase on login lookup', async () => {
    userRepo.findOne.mockResolvedValueOnce(mockUser);
    await service.login({
      email: '  Test@Example.COM  ',
      password: 'password',
    });
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
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

  it('should throw UnauthorizedException when password is invalid', async () => {
    userRepo.findOne.mockResolvedValueOnce(mockUser);
    const bcrypt = require('bcrypt');
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);
    await expect(
      service.login({ email: 'test@example.com', password: 'wrongpassword' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when user is disabled', async () => {
    userRepo.findOne.mockResolvedValueOnce({ ...mockUser, isActive: false });
    await expect(
      service.login({ email: 'test@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should return user when validateUser finds user by payload sub', async () => {
    userRepo.findOne.mockResolvedValueOnce(mockUser);
    const result = await service.validateUser({
      sub: mockUser.id,
      email: mockUser.email,
    });
    expect(result).toEqual(mockUser);
    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { id: mockUser.id },
    });
  });

  it('should return null when validateUser does not find user', async () => {
    userRepo.findOne.mockResolvedValueOnce(null);
    const result = await service.validateUser({
      sub: 'missing-id',
      email: 'test@example.com',
    });
    expect(result).toBeNull();
  });
});
