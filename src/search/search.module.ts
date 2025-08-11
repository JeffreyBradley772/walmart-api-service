import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SearchController } from '@/search/search.controller';
import { SearchService } from '@/search/search.service';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
