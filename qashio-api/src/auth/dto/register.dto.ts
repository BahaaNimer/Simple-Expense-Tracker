import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

const PASSWORD_RULES = {
  minLength: 8,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /\d/,
  special: /[^A-Za-z0-9]/,
};

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({
    example: 'SecurePass1!',
    description:
      'Min 8 characters, at least one uppercase, one lowercase, one number, one special character',
  })
  @IsString()
  @MinLength(PASSWORD_RULES.minLength, {
    message: 'Password must be at least 8 characters',
  })
  @Matches(PASSWORD_RULES.upper, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(PASSWORD_RULES.lower, {
    message: 'Password must contain at least one lowercase letter',
  })
  @Matches(PASSWORD_RULES.number, {
    message: 'Password must contain at least one number',
  })
  @Matches(PASSWORD_RULES.special, {
    message: 'Password must contain at least one special character',
  })
  password: string;
}
