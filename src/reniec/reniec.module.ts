import { Module } from '@nestjs/common';
import { ReniecService } from './reniec.service';
import { ReniecController } from './reniec.controller';
import { HttpModule } from '@nestjs/axios';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [HttpModule, DrizzleModule],
  controllers: [ReniecController],
  providers: [ReniecService],
})
export class ReniecModule {}
