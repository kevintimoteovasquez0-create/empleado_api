import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { DrizzleModule } from '../drizzle/drizzle.module'; // 👈 IMPORTANTE

@Module({
  imports: [DrizzleModule], // 👈 Cambiamos Prisma por Drizzle
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
