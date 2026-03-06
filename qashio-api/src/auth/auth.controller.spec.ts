import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { register: jest.Mock; login: jest.Mock };

  const mockRegisterResponse = {
    user: { id: 'user-1', email: 'user@example.com' },
    access_token: 'jwt-token',
  };
  const mockLoginResponse = {
    user: { id: 'user-1', email: 'user@example.com' },
    access_token: 'jwt-token',
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn().mockResolvedValue(mockRegisterResponse),
      login: jest.fn().mockResolvedValue(mockLoginResponse),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register and return user and token', async () => {
    const dto = { email: 'user@example.com', password: 'SecurePass1!' };
    const result = await controller.register(dto);
    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockRegisterResponse);
  });

  it('should call login and return user and token', async () => {
    const dto = { email: 'user@example.com', password: 'password' };
    const result = await controller.login(dto);
    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockLoginResponse);
  });
});
