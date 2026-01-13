import { Module } from "@nestjs/common";
import { EmailService } from "./email.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { EmailController } from "./email.controller";

@Module({

    imports: [PrismaModule],
    controllers: [EmailController],
    providers: [EmailService],
    exports: [EmailService]

})

export class EmailModule{}