import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength, Validate } from "class-validator";
import { Match } from "../decorator/match.decorator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePasswordDto {

  @ApiProperty({
    description: "Nueva contraseña del usuario. Debe tener al menos 8 caracteres, incluyendo mayúscula, minúscula, número y carácter especial.",
    minLength: 8,
    maxLength: 60,
    example: "Password123!"
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: "La contraseña es obligatoria." })
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres." })
  @MaxLength(60, { message: "La contraseña no puede superar los 60 caracteres." })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message: "La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial."
  })
  password: string;

  @ApiProperty({
    description: "Confirmación de la nueva contraseña. Debe coincidir con el campo password.",
    minLength: 8,
    maxLength: 60,
    example: "Password123!"
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: "Confirmar contraseña es obligatorio." })
  @Validate(Match, ["password"], { message: "Las contraseñas no coinciden." })
  confirmPassword: string;

}