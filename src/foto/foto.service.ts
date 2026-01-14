import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import { Injectable, BadRequestException } from '@nestjs/common';
import { envs } from 'src/config';

@Injectable()
export class FotoService {
  constructor() {}

  private directorioUploads = 'uploads';

  private generarTimestamp(){
    const [segundos, nanosegundos] = process.hrtime();
    return moment().tz('America/Lima').format('YYYYMMDD_HHmmss') + `_${segundos}${nanosegundos}`;
  }

  private generarNombreArchivo(id: number, extension: string): string {
    const timestamp = this.generarTimestamp();
    return `${id}_${timestamp}.${extension}`;
  }

  private generarPathArchivo(entidad: string, id: number, extension: string): string {
    const nombreArchivo = this.generarNombreArchivo(id, extension);
    return path.join(this.directorioUploads, entidad, `${entidad}_${id}`, nombreArchivo);
  }

  private eliminarImagenAnterior(entidad: string, id: number, nombreArchivo: string) {
    if (!nombreArchivo) return;
    const rutaImagen = path.join(this.directorioUploads, entidad, `${entidad}_${id}`, nombreArchivo);
    if (fs.existsSync(rutaImagen)) {
      fs.unlinkSync(rutaImagen);
    }
  }

  async guardarImagen(id: number, entidad: string, archivo: Express.Multer.File): Promise<string> {
    try {
      if (!archivo) {
        throw new BadRequestException('No se ha proporcionado un archivo.');
      }

      const extension = archivo.mimetype.split('/')[1];
      const extensionesPermitidas = ['jpg', 'jpeg', 'png', 'webp'];

      if (!extensionesPermitidas.includes(extension.toLowerCase())) {
        throw new BadRequestException(`Formato de imagen no permitido. Extensiones permitidas: ${extensionesPermitidas.join(', ')}`);
      }

      const rutaArchivo = this.generarPathArchivo(entidad, id, extension);
      const nombreArchivo = path.basename(rutaArchivo);

      if (!rutaArchivo) {
        throw new BadRequestException('No se pudo generar la ruta del archivo.');
      }

      // Asegurar que la carpeta existe
      fs.mkdirSync(path.dirname(rutaArchivo), { recursive: true });

      // Guardar la imagen
      fs.writeFileSync(rutaArchivo, archivo.buffer);

      return nombreArchivo;

    } catch (error) {
      throw new BadRequestException(error);
    }
  }


  async guardarImagenes(id: number, entidad: string, archivos: Express.Multer.File[]): Promise<string[]> {
    try {
      if (!archivos || archivos.length === 0) {
        throw new BadRequestException('No se han proporcionado archivos.');
      }
  
      const rutasArchivos: string[] = [];
  
      for (const archivo of archivos) {

        const extension = archivo.mimetype.split('/')[1];

        const rutaArchivo = this.generarPathArchivo(entidad, id, extension);

        const nombreArchivo = path.basename(rutaArchivo);
  
        if (!rutaArchivo) {
          throw new BadRequestException('No se pudo generar la ruta del archivo.');
        }
  
        // Asegurar que la carpeta existe
        fs.mkdirSync(path.dirname(rutaArchivo), { recursive: true });
  
        // Guardar la imagen
        fs.writeFileSync(rutaArchivo, archivo.buffer);
  
        rutasArchivos.push(nombreArchivo);
      }
  
      return rutasArchivos; // Retorna las rutas de las imágenes guardadas
    } catch (error) {
      throw new BadRequestException(error);
    }
  }  

  async actualizarImagen(id: number, entidad: string, nombre_imagen: string, archivo?: Express.Multer.File): Promise<string>{
    
    if(!archivo){
      return nombre_imagen
    }

    if (nombre_imagen) {
      this.eliminarImagenAnterior(entidad, id, nombre_imagen); // Eliminar imagen anterior
    }

    const nuevaRuta = await this.guardarImagen(id, entidad, archivo);

    return nuevaRuta;

  }

  async actualizarImagenes(entidad: string, id: number, imagenesGenerales: { nombre_imagen: string }[], archivos?: Express.Multer.File[]): Promise<string[]>{
    
    if (!archivos || archivos.length === 0) {
      return imagenesGenerales.map(foto => foto.nombre_imagen);
    }

    const nombresActuales = imagenesGenerales.map(foto => foto.nombre_imagen);

    const nuevosNombres = await this.guardarImagenes(id, entidad, archivos);

    const nombresAEliminar = nombresActuales.filter(url => !nuevosNombres.includes(url));

    // Eliminar todas las imágenes anteriores
    for (const nombre of nombresAEliminar) {
      this.eliminarImagenAnterior(entidad, id, nombre);
    }
    
    return nuevosNombres;

  }

  obtenerUrlCompleta(entidad: string, id: number, nombreArchivo: string): string {
    return `${envs.baseUrl}/uploads/${entidad}/${entidad}_${id}/${nombreArchivo}`;
  }

}