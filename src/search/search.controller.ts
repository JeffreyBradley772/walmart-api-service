import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  HttpException,
  Query,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FullSearchQueryDto, WalmartApiResponseDto } from './dtos';
import { WalmartProduct } from './types';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search for products on Walmart',
    description:
      'Searches the Walmart API for products matching the query string',
  })
  @ApiQuery({
    name: 'query',
    type: String,
    required: true,
    description: 'Search query',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort by attribute (e.g., price, title)',
  })
  @ApiQuery({
    name: 'order',
    enum: ['asc', 'desc'],
    required: false,
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'numItems',
    type: Number,
    required: false,
    description: 'Number of items to return (1-25)',
  })
  @ApiQuery({
    name: 'start',
    type: Number,
    required: false,
    description: 'Starting item number for pagination',
  })
  @ApiQuery({
    name: 'responseGroup',
    type: String,
    required: false,
    description: 'Response group (e.g., base, full)',
  })
  @ApiQuery({
    name: 'facet',
    type: String,
    required: false,
    description: 'Enable faceting',
  })
  @ApiQuery({
    name: 'facet.filter',
    type: String,
    required: false,
    description: 'Facet filter',
  })
  @ApiQuery({
    name: 'facet.range',
    type: String,
    required: false,
    description: 'Facet range',
  })
  @ApiResponse({
    status: 200,
    description:
      'Products successfully retrieved. Returns list of product name and price based on relevance to query.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Missing or invalid parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to fetch products',
  })
  async searchProduct(@Query() query: FullSearchQueryDto): Promise<string[]> {
    console.log(`Query from product controller ${query.start}`);

    try {
      const products = await this.searchService.getProductsNameAndPrice(query);
      return products;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch products: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('full')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get full product results on Walmart',
    description:
      'Searches the Walmart API for products matching the query string',
  })
  @ApiQuery({
    name: 'query',
    type: String,
    required: true,
    description: 'Search query',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort by attribute (e.g., price, title)',
  })
  @ApiQuery({
    name: 'order',
    enum: ['asc', 'desc'],
    required: false,
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'numItems',
    type: Number,
    required: false,
    description: 'Number of items to return (1-25)',
  })
  @ApiQuery({
    name: 'start',
    type: Number,
    required: false,
    description: 'Starting item number for pagination',
  })
  @ApiQuery({
    name: 'responseGroup',
    type: String,
    required: false,
    description: 'Response group (e.g., base, full)',
  })
  @ApiQuery({
    name: 'facet',
    type: String,
    required: false,
    description: 'Enable faceting',
  })
  @ApiQuery({
    name: 'facet.filter',
    type: String,
    required: false,
    description: 'Facet filter',
  })
  @ApiQuery({
    name: 'facet.range',
    type: String,
    required: false,
    description: 'Facet range',
  })
  @ApiResponse({
    status: 200,
    description:
      'Products successfully retrieved. Returns full product details.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Missing or invalid parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to fetch products',
  })
  async searchProductFull(
    @Query() query: FullSearchQueryDto,
  ): Promise<WalmartProduct[]> {
    console.log(`Query from product controller ${query.start}`);
    try {
      const products = await this.searchService.getWalmartProducts(query);
      return products;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch products: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('dev')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Get Walmart full API response. Useful if pagination reponse is needed as well.',
    description:
      'Searches the Walmart API for products matching the query string',
  })
  @ApiQuery({
    name: 'query',
    type: String,
    required: true,
    description: 'Search query',
  })
  @ApiQuery({
    name: 'sort',
    type: String,
    required: false,
    description: 'Sort by attribute (e.g., price, title)',
  })
  @ApiQuery({
    name: 'order',
    enum: ['asc', 'desc'],
    required: false,
    description: 'Sort order',
  })
  @ApiQuery({
    name: 'numItems',
    type: Number,
    required: false,
    description: 'Number of items to return (1-25)',
  })
  @ApiQuery({
    name: 'start',
    type: Number,
    required: false,
    description: 'Starting item number for pagination',
  })
  @ApiQuery({
    name: 'responseGroup',
    type: String,
    required: false,
    description: 'Response group (e.g., base, full)',
  })
  @ApiQuery({
    name: 'facet',
    type: String,
    required: false,
    description: 'Enable faceting',
  })
  @ApiQuery({
    name: 'facet.filter',
    type: String,
    required: false,
    description: 'Facet filter',
  })
  @ApiQuery({
    name: 'facet.range',
    type: String,
    required: false,
    description: 'Facet range',
  })
  @ApiResponse({
    status: 200,
    description:
      'Products successfully retrieved. Returns full Walmart API response.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Missing or invalid parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to fetch products',
  })
  async searchProductDev(
    @Query() query: FullSearchQueryDto,
  ): Promise<WalmartApiResponseDto> {
    console.log(`Query from product controller ${query.start}`);
    try {
      const response = await this.searchService.searchWalmart(query);
      return response;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch products: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
