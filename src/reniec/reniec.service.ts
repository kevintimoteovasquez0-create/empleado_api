import { BadRequestException, Injectable } from '@nestjs/common';
import { NumeroDto } from './dto/numero.dto';
import { envs } from '../config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReniecService {

  private readonly API_URL = envs.apiReniecDniUrl
  private readonly TOKEN_RENIEC_DNI = envs.tokenReniecDni

  constructor(private readonly httpService: HttpService){}
  
  async findDataUsuarioByDocument(numero: NumeroDto){
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.API_URL}/?numero=${numero}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.TOKEN_RENIEC_DNI}`, // Reemplaza con tu token real
            },
          }
        )
      )
      return response.data
    } catch (error) {
      throw new BadRequestException(error.response?.data?.message || 'Error en la consulta');
    }
  }
}
