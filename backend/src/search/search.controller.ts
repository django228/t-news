import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search for users or posts' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async search(@Query('query') query: string, @Query('type') type: 'users' | 'posts') {
    return this.searchService.search(query, type);
  }
}

