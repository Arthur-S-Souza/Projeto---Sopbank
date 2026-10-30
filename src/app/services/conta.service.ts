import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Transacao } from '../models/transacao.model';
import { Carteira, Usuario } from '../models/usuario.model';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

type OperacaoResposta = { saldo: number; transacao?: Transacao };

@Injectable({
  providedIn: 'root',
})
export class ContaService {
  constructor(
    private http: HttpClient,
    private api: ApiService,
    private auth: AuthService
  ) {}

  async obterCarteira(): Promise<{ ok: true; data: Carteira } | { ok: false; mensagem: string }> {
    try {
      const data = await this.http.get<Carteira>(`${this.api.url}/wallet`).toPromise();
      if (data) {
        this.auth.atualizarUsuarioLocal(data);
      }
      return { ok: true, data: data! };
    } catch (error) {
      return { ok: false, mensagem: this.api.mensagemErro(error) };
    }
  }

  async listarDoUsuario(usuarioId: string, filtro = 'todas'): Promise<Transacao[]> {
    const params = filtro !== 'todas' ? `?tipo=${filtro}` : '';
    try {
      return (
        (await this.http
          .get<Transacao[]>(`${this.api.url}/transactions${params}`)
          .toPromise()) ?? []
      );
    } catch {
      return [];
    }
  }

  private aplicarSaldo(saldo: number): void {
    const atual = this.auth.getUsuarioLogado();
    if (atual) {
      this.auth.atualizarUsuarioLocal({ ...atual, saldo });
    }
  }

  async depositar(valor: number): Promise<{ ok: true } | { ok: false; mensagem: string }> {
    try {
      const res = await this.http
        .post<OperacaoResposta>(`${this.api.url}/wallet/deposit`, { valor: Number(valor) })
        .toPromise();
      this.aplicarSaldo(res!.saldo);
      return { ok: true };
    } catch (error) {
      return { ok: false, mensagem: this.api.mensagemErro(error) };
    }
  }

  async sacar(valor: number): Promise<{ ok: true } | { ok: false; mensagem: string }> {
    try {
      const res = await this.http
        .post<OperacaoResposta>(`${this.api.url}/wallet/withdraw`, { valor: Number(valor) })
        .toPromise();
      this.aplicarSaldo(res!.saldo);
      return { ok: true };
    } catch (error) {
      return { ok: false, mensagem: this.api.mensagemErro(error) };
    }
  }

  async transferir(
    cpfDestino: string,
    valor: number
  ): Promise<{ ok: true } | { ok: false; mensagem: string }> {
    try {
      const res = await this.http
        .post<OperacaoResposta>(`${this.api.url}/wallet/transfer`, {
          cpfDestino,
          valor: Number(valor),
        })
        .toPromise();
      this.aplicarSaldo(res!.saldo);
      return { ok: true };
    } catch (error) {
      return { ok: false, mensagem: this.api.mensagemErro(error) };
    }
  }

  async enviarPix(
    chave: string,
    valor: number
  ): Promise<{ ok: true } | { ok: false; mensagem: string }> {
    try {
      const res = await this.http
        .post<OperacaoResposta>(`${this.api.url}/wallet/pix`, {
          chave,
          valor: Number(valor),
        })
        .toPromise();
      this.aplicarSaldo(res!.saldo);
      return { ok: true };
    } catch (error) {
      return { ok: false, mensagem: this.api.mensagemErro(error) };
    }
  }

  async atualizarChavePix(
    chavePix: string
  ): Promise<{ ok: true; usuario: Usuario } | { ok: false; mensagem: string }> {
    try {
      const usuario = await this.http
        .put<Usuario>(`${this.api.url}/wallet/pix-key`, { chavePix })
        .toPromise();
      this.auth.atualizarUsuarioLocal(usuario!);
      return { ok: true, usuario: usuario! };
    } catch (error) {
      return { ok: false, mensagem: this.api.mensagemErro(error) };
    }
  }
}
