import { Module } from '@nestjs/common';
import { LicenciaMedicaService } from './licencia_medica.service';
import { LicenciaMedicaController } from './licencia_medica.controller';
import { DrizzleModule } from 'src/drizzle/drizzle.module';

@Module({
    imports: [DrizzleModule],
    controllers: [LicenciaMedicaController],
    providers: [LicenciaMedicaService],
    exports: [LicenciaMedicaService],
})
export class LicenciaMedicaModule { }
