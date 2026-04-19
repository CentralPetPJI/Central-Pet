import { Controller, Get, Param, Post, Body, Patch, UseGuards, Delete } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto, UpdateInstitutionDto } from './dto/institution.dto';
import { CurrentUser } from '@/decorators/current-user.decorator';
import { PublicUser } from '@/modules/users/users.service';
import { MockUser } from '@/mocks';
import { SessionGuard } from '@/modules/auth/guards/session.guard';

@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  async findAll() {
    return this.institutionsService.findAllPublic();
  }

  @Get('me')
  @UseGuards(SessionGuard)
  async findMe(@CurrentUser() user: PublicUser | MockUser) {
    return this.institutionsService.findByUserId(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.institutionsService.findByIdPublic(id);
  }

  @Post()
  @UseGuards(SessionGuard)
  async create(@CurrentUser() user: PublicUser | MockUser, @Body() dto: CreateInstitutionDto) {
    return this.institutionsService.create(user.id, dto);
  }

  @Patch('mine')
  @UseGuards(SessionGuard)
  async update(@CurrentUser() user: PublicUser | MockUser, @Body() dto: UpdateInstitutionDto) {
    return this.institutionsService.update(user.id, dto);
  }

  @Delete('me')
  @UseGuards(SessionGuard)
  async remove(@CurrentUser() user: PublicUser | MockUser) {
    return this.institutionsService.remove(user.id);
  }
}
