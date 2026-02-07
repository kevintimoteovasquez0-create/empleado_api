import { Module } from '@nestjs/common';
import { ContratoService } from './contrato.service';
import { ContratoController } from './contrato.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [ContratoController],
  providers: [ContratoService],
  exports: [ContratoService],
})
export class ContratoModule {}
