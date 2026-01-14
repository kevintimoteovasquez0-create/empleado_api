import { forwardRef, Module } from "@nestjs/common";
import { FotoService } from "./foto.service";
import { UsuarioModule } from "src/usuario/usuario.module";

@Module({
    imports: [forwardRef(() => UsuarioModule)],
    providers: [FotoService],
    exports: [FotoService]
})
export class FotoModule {}