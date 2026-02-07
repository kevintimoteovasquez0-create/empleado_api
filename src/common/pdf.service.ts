import { Injectable, BadRequestException } from '@nestjs/common';
import { envs } from 'src/config';
import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';

@Injectable()
export class PdfService {
  constructor() {}

  private directorioUploads = 'uploads';

  private generarTimestamp() {
    const [segundos, nanosegundos] = process.hrtime();
    return (
      moment().tz('America/Lima').format('YYYYMMDD_HHmmss') +
      `_${segundos}${nanosegundos}`
    );
  }

  private generarNombreArchivo(
    id: number,
    tipo: string,
    extension: string,
  ): string {
    const timestamp = this.generarTimestamp();
    return `${tipo}_${id}_${timestamp}.${extension}`;
  }

  private generarPathArchivo(
    entidad: string,
    id: number,
    tipo: string,
    extension: string,
  ): string {
    const nombreArchivo = this.generarNombreArchivo(id, tipo, extension);
    return path.join(
      this.directorioUploads,
      entidad,
      `${entidad}_${id}`,
      nombreArchivo,
    );
  }

  private eliminarPdfAnterior(
    entidad: string,
    id: number,
    nombreArchivo: string,
  ) {
    if (!nombreArchivo) return;
    const rutaPdf = path.join(
      this.directorioUploads,
      entidad,
      `${entidad}_${id}`,
      nombreArchivo,
    );
    if (fs.existsSync(rutaPdf)) {
      fs.unlinkSync(rutaPdf);
    }
  }

  async guardarPdf(
    id: number,
    entidad: string,
    tipo: string,
    archivo: Express.Multer.File,
  ): Promise<string> {
    try {
      if (!archivo) {
        throw new BadRequestException('No se ha proporcionado un archivo.');
      }

      // Validar que sea un PDF
      if (archivo.mimetype !== 'application/pdf') {
        throw new BadRequestException('Solo se permiten archivos PDF.');
      }

      // Validar tamaño máximo 2MB
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (archivo.size > maxSize) {
        throw new BadRequestException(
          'El archivo PDF no debe superar los 2MB.',
        );
      }

      const extension = 'pdf';
      const rutaArchivo = this.generarPathArchivo(entidad, id, tipo, extension);
      const nombreArchivo = path.basename(rutaArchivo);

      if (!rutaArchivo) {
        throw new BadRequestException(
          'No se pudo generar la ruta del archivo.',
        );
      }

      // Asegurar que la carpeta existe
      fs.mkdirSync(path.dirname(rutaArchivo), { recursive: true });

      // Guardar el PDF
      fs.writeFileSync(rutaArchivo, archivo.buffer);

      return nombreArchivo;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async actualizarPdf(
    id: number,
    entidad: string,
    tipo: string,
    nombre_pdf: string | null,
    archivo?: Express.Multer.File,
  ): Promise<string | null> {
    if (!archivo) {
      return nombre_pdf;
    }

    if (nombre_pdf) {
      this.eliminarPdfAnterior(entidad, id, nombre_pdf); // Eliminar PDF anterior
    }

    const nuevaRuta = await this.guardarPdf(id, entidad, tipo, archivo);

    return nuevaRuta;
  }

  obtenerUrlCompleta(
    entidad: string,
    id: number,
    nombreArchivo: string,
  ): string {
    return `${envs.baseUrl}/uploads/${entidad}/${entidad}_${id}/${nombreArchivo}`;
  }

  async eliminarPdf(
    entidad: string,
    id: number,
    nombreArchivo: string,
  ): Promise<void> {
    try {
      if (!nombreArchivo) return;

      const rutaPdf = path.join(
        this.directorioUploads,
        entidad,
        `${entidad}_${id}`,
        nombreArchivo,
      );

      if (fs.existsSync(rutaPdf)) {
        fs.unlinkSync(rutaPdf);
      }
    } catch (error) {
      throw new BadRequestException(
        `Error al eliminar el archivo PDF: ${error.message}`,
      );
    }
  }

  async existePdf(
    entidad: string,
    id: number,
    nombreArchivo: string,
  ): Promise<boolean> {
    if (!nombreArchivo) return false;

    const rutaPdf = path.join(
      this.directorioUploads,
      entidad,
      `${entidad}_${id}`,
      nombreArchivo,
    );
    return fs.existsSync(rutaPdf);
  }
}
