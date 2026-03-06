import { IsNumber, IsEnum, IsDateString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BudgetPeriod } from '../../entities/budget.entity';

export class CreateBudgetDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: ['weekly', 'monthly', 'yearly'] })
  @IsEnum(['weekly', 'monthly', 'yearly'])
  period: BudgetPeriod;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsDateString()
  startDate: string;

  @ApiProperty()
  @IsDateString()
  endDate: string;
}
