import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
  imports: [DrizzleModule],
  controllers: [EmpresaController],
  providers: [EmpresaService],
  exports: [EmpresaService]
})
export class EmpresaModule {}
