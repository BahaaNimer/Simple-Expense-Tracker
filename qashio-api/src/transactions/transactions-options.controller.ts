import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions/options')
export class TransactionsOptionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('reference-prefixes')
  @ApiOperation({
    summary: 'Get distinct reference prefixes for filter options',
  })
  getReferencePrefixes(@CurrentUser() user: User) {
    return this.transactionsService.getReferencePrefixes(user.id);
  }
}
