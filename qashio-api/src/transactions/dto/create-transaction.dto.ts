import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsUUID,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  TransactionType,
  TransactionStatus,
} from '../../entities/transaction.entity';

const REFERENCE_PATTERN = /^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$/;

export class CreateTransactionDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty()
  @IsString()
  date: string;

  @ApiProperty({ enum: ['income', 'expense'] })
  @IsEnum(['income', 'expense'])
  type: TransactionType;

  @ApiProperty({
    example: 'ABCD-1234',
    description: 'Reference in format XXXX-XXXX',
  })
  @IsString()
  @Matches(REFERENCE_PATTERN, {
    message: 'Reference must be in format XXXX-XXXX (e.g. ABCD-1234)',
  })
  reference: string;

  @ApiProperty()
  @IsString()
  counterparty: string;

  @ApiProperty({
    enum: ['Active', 'Inactive', 'Completed', 'Pending', 'Failed'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive', 'Completed', 'Pending', 'Failed'])
  status?: TransactionStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  narration?: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;
}
