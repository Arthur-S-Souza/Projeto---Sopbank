import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DadosCadastro, Sessao, Usuario } from '../models/usuario.model';
import { cpfValido, limparCpf } from '../utils/cpf.util';
import { gerarId } from '../utils/id.util';
import { StorageService } from './storage.service';

const USUARIOS_KEY = 'sopbank:usuarios';
const SESSAO_KEY = 'sopbank:sessao';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private storage: StorageService, private router: Router) {}

  private hashSenha(senha: string): string {
    return btoa(unescape(encodeURIComponent(senha)));
  }

  private getUsuarios(): Usuario[] {
    return this.storage.get<Usuario[]>(USUARIOS_KEY) ?? [];
  }

  private saveUsuarios(usuarios: Usuario[]): void {
    this.storage.set(USUARIOS_KEY, usuarios);
  }

  getUsuarioLogado(): Usuario | null {
    const sessao = this.storage.get<Sessao>(SESSAO_KEY);
    if (!sessao) {
      return null;
    }
    return this.getUsuarios().find((u) => u.id === sessao.usuarioId) ?? null;
  }

  isAutenticado(): boolean {
    return this.getUsuarioLogado() !== null;
  }

  cadastrar(dados: DadosCadastro): { ok: true } | { ok: false; mensagem: string } {
    const nome = dados.nome?.trim();
    const email = dados.email?.trim().toLowerCase();
    const senha = dados.senha?.trim();
    const telefone = dados.telefone?.trim();
    const cpf = limparCpf(dados.cpf);
    const dataNascimento = dados.dataNascimento?.trim();

    if (!nome || nome.length < 3) {
      return { ok: false, mensagem: 'Informe seu nome completo.' };
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, mensagem: 'Informe um e-mail válido.' };
    }
    if (!senha || senha.length < 6) {
      return { ok: false, mensagem: 'A senha deve ter pelo menos 6 caracteres.' };
    }
    if (!telefone || limparCpf(telefone).length < 10) {
      return { ok: false, mensagem: 'Informe um telefone válido.' };
    }
    if (!cpfValido(cpf)) {
      return { ok: false, mensagem: 'CPF inválido.' };
    }
    if (!dataNascimento) {
      return { ok: false, mensagem: 'Informe a data de nascimento.' };
    }

    const usuarios = this.getUsuarios();
    if (usuarios.some((u) => u.email === email)) {
      return { ok: false, mensagem: 'Este e-mail já está cadastrado.' };
    }
    if (usuarios.some((u) => u.cpf === cpf)) {
      return { ok: false, mensagem: 'Este CPF já está cadastrado.' };
    }

    const usuario: Usuario = {
      id: gerarId(),
      nome,
      email,
      senhaHash: this.hashSenha(senha),
      telefone,
      cpf,
      dataNascimento,
      saldo: 0,
      criadoEm: new Date().toISOString(),
    };

    usuarios.push(usuario);
    this.saveUsuarios(usuarios);
    this.storage.set<Sessao>(SESSAO_KEY, { usuarioId: usuario.id, email: usuario.email });
    return { ok: true };
  }

  login(email: string, senha: string): { ok: true } | { ok: false; mensagem: string } {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedSenha = senha?.trim();
    if (!normalizedEmail || !normalizedSenha) {
      return { ok: false, mensagem: 'Preencha e-mail e senha.' };
    }

    const usuario = this.getUsuarios().find((u) => u.email === normalizedEmail);
    if (!usuario || usuario.senhaHash !== this.hashSenha(normalizedSenha)) {
      return { ok: false, mensagem: 'E-mail ou senha incorretos.' };
    }

    this.storage.set<Sessao>(SESSAO_KEY, { usuarioId: usuario.id, email: usuario.email });
    return { ok: true };
  }

  logout(): void {
    this.storage.remove(SESSAO_KEY);
    this.router.navigate(['/']);
  }

  atualizarUsuario(usuario: Usuario): void {
    const usuarios = this.getUsuarios().map((u) => (u.id === usuario.id ? usuario : u));
    this.saveUsuarios(usuarios);
  }
}
