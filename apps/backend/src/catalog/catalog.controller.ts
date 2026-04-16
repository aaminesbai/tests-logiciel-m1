import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('users')
  findUsers() {
    return this.catalogService.findUsers();
  }

  @Get('users/:id')
  findUser(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.findUser(id);
  }
}
