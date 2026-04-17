import { Controller, Get, Param } from '@nestjs/common';
import { InstitutionsService } from './institutions.service';

@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  async findAll() {
    return this.institutionsService.findAllPublic();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.institutionsService.findByIdPublic(id);
  }

  // @Post()
  // async create(@Body() dto: CreateInstitutionDto) {
  //   // TODO: decidir se pessoas físicas podem criar instituição. Atualmente desabilitado.
  // }
}
