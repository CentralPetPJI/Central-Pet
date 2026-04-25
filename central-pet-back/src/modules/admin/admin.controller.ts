import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  ForbiddenException,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { SessionGuard } from '@/modules/auth/guards/session.guard';
import { AdminGuard } from './admin.guard';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { PublicUser } from '@/modules/users/users.service';
import { CreateAdminDto } from './dto/create-admin.dto';

@Controller('admin')
@UseGuards(SessionGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('create-admin')
  async createAdmin(@Body() dto: CreateAdminDto, @CurrentUser() user: PublicUser) {
    // only ROOT can create admins
    if (user.role !== 'ROOT') throw new ForbiddenException('Only ROOT can create admins');

    return this.adminService.createAdmin(
      { fullName: dto.fullName, email: dto.email, password: dto.password },
      user.id,
    );
  }

  @Patch('users/:id/toggle-status')
  async toggleUserStatus(@Param('id') userId: string, @CurrentUser() admin: PublicUser) {
    return this.adminService.toggleUserStatus(userId, admin.id);
  }

  @Get('pets')
  async getPets(
    @Query('userId') userId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 12;
    return this.adminService.getPets(userId, pageNum, limitNum);
  }

  @Patch('pets/:id/toggle-deletion')
  async togglePetDeletion(@Param('id') petId: string, @CurrentUser() admin: PublicUser) {
    return this.adminService.togglePetDeletion(petId, admin.id);
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 20;
    return this.adminService.getAuditLogs(userId, pageNum, limitNum);
  }

  @Get('reports')
  async getReports() {
    return this.adminService.getReports();
  }

  @Post('reports/:id/resolve')
  async resolveReport(
    @Param('id') reportId: string,
    @Body('status') status: string,
    @Body('blockPet') blockPet: boolean,
    @CurrentUser() admin: PublicUser,
  ) {
    return this.adminService.resolveReport(reportId, admin.id, status, Boolean(blockPet));
  }
}
