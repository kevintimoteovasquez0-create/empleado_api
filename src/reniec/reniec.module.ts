import { Module } from '@nestjs/common';
import { ReniecService } from './reniec.service';
import { ReniecController } from './reniec.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ReniecController],
  providers: [ReniecService],
})
export class ReniecModule {}
