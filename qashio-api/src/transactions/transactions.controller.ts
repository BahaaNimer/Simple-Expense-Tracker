import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  create(@Body() dto: CreateTransactionDto, @CurrentUser() user: User) {
    return this.transactionsService.create(dto, user.id);
  }

  @Get('summary/report')
  @ApiOperation({ summary: 'Get income/expense summary for date range' })
  getSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: User,
  ) {
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : (() => {
          const d = new Date();
          d.setMonth(d.getMonth() - 1);
          return d;
        })();
    return this.transactionsService.getSummary(
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0],
      user.id,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List transactions with filters and pagination' })
  @ApiPaginatedResponse('Paginated transactions list')
  findAll(@Query() query: QueryTransactionDto, @CurrentUser() user: User) {
    return this.transactionsService.findAll(query, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.transactionsService.findOne(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a transaction' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser() user: User,
  ) {
    return this.transactionsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a transaction' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.transactionsService.remove(id, user.id);
  }
}
