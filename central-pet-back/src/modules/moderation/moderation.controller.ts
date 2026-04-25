import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { SessionGuard } from '@/modules/auth/guards/session.guard';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { PublicUser } from '@/modules/users/users.service';
import { CreateReportDto } from './dto/create-report.dto';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('reports')
  @UseGuards(SessionGuard)
  async createReport(@CurrentUser() user: PublicUser, @Body() dto: CreateReportDto) {
    return this.moderationService.createReport(user.id, dto);
  }
}
