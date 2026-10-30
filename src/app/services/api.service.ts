import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get url(): string {
    return environment.apiUrl;
  }

  mensagemErro(error: unknown, fallback = 'Não foi possível concluir a operação.'): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error as { mensagem?: string } | null;
      if (body?.mensagem) {
        return body.mensagem;
      }
    }
    return fallback;
  }
}
