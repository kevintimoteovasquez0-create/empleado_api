import { forwardRef, Module } from "@nestjs/common";
import { FotoService } from "./foto.service";
import { UsuarioModule } from "src/usuario/usuario.module";
import { LocalModule } from "src/local/local.module";

@Module({
    imports: [forwardRef(() => UsuarioModule), forwardRef(() => LocalModule)],
    providers: [FotoService],
    exports: [FotoService]
})
export class FotoModule {}