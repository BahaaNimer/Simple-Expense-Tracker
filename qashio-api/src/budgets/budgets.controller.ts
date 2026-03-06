import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../entities/user.entity';

@ApiTags('budgets')
@ApiBearerAuth()
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a budget' })
  create(@Body() dto: CreateBudgetDto, @CurrentUser() user: User) {
    return this.budgetsService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all budgets' })
  findAll(@CurrentUser() user: User) {
    return this.budgetsService.findAll(user.id);
  }

  @Get(':id/usage')
  @ApiOperation({ summary: 'Get budget spending vs. allocated' })
  getUsage(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.budgetsService.getBudgetUsage(id, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a budget' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBudgetDto,
    @CurrentUser() user: User,
  ) {
    return this.budgetsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a budget' })
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.budgetsService.remove(id, user.id);
  }
}
