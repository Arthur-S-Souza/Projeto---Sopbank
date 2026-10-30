import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Carteira, DadosCadastro, Resultado, Usuario } from '../models/usuario.model';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';

const TOKEN_KEY = 'sopbank:token';

interface AuthResponse {
  token: string;
  usuario: Usuario;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  readonly usuario$ = this.usuarioSubject.asObservable();

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private storage: StorageService,
    private router: Router
  ) {}

  getToken(): string | null {
    return this.storage.get<string>(TOKEN_KEY);
  }

  getUsuarioLogado(): Usuario | null {
    return this.usuarioSubject.value;
  }

  isAutenticado(): boolean {
    return !!this.getToken();
  }

  async inicializarSessao(): Promise<void> {
    if (!this.getToken()) {
      this.usuarioSubject.next(null);
      return;
    }
    await this.carregarPerfil();
  }

  async carregarPerfil(): Promise<Resultado<Usuario>> {
    try {
      const usuario = await this.http
        .get<Usuario>(`${this.api.url}/auth/me`)
        .toPromise();
      this.usuarioSubject.next(usuario ?? null);
      return { ok: true, data: usuario! };
    } catch (error) {
      this.storage.remove(TOKEN_KEY);
      this.usuarioSubject.next(null);
      return { ok: false, mensagem: this.api.mensagemErro(error, 'Sessão expirada.') };
    }
  }

  async cadastrar(dados: DadosCadastro): Promise<Resultado<Usuario>> {
    try {
      const res = await this.http
        .post<AuthResponse>(`${this.api.url}/auth/register`, dados)
        .toPromise();
      this.persistirLogin(res!);
      return { ok: true, data: res!.usuario };
    } catch (error) {
      return { ok: false, mensagem: this.api.mensagemErro(error, 'Falha no cadastro.') };
    }
  }

  async login(email: string, senha: string): Promise<Resultado<Usuario>> {
    try {
      const res = await this.http
        .post<AuthResponse>(`${this.api.url}/auth/login`, { email, senha })
        .toPromise();
      this.persistirLogin(res!);
      return { ok: true, data: res!.usuario };
    } catch (error) {
      return { ok: false, mensagem: this.api.mensagemErro(error, 'Falha no login.') };
    }
  }

  atualizarUsuarioLocal(usuario: Usuario): void {
    this.usuarioSubject.next(usuario);
  }

  logout(): void {
    this.storage.remove(TOKEN_KEY);
    this.usuarioSubject.next(null);
    this.router.navigate(['/']);
  }

  private persistirLogin(res: AuthResponse): void {
    this.storage.set(TOKEN_KEY, res.token);
    this.usuarioSubject.next(res.usuario);
  }
}
