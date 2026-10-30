import { Injectable } from '@angular/core';
import { Transacao, TipoTransacao } from '../models/transacao.model';
import { Usuario } from '../models/usuario.model';
import { limparCpf } from '../utils/cpf.util';
import { gerarId } from '../utils/id.util';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

const TRANSACOES_KEY = 'sopbank:transacoes';

@Injectable({
  providedIn: 'root',
})
export class ContaService {
  constructor(private auth: AuthService, private storage: StorageService) {}

  private getTransacoes(): Transacao[] {
    return this.storage.get<Transacao[]>(TRANSACOES_KEY) ?? [];
  }

  private saveTransacoes(transacoes: Transacao[]): void {
    this.storage.set(TRANSACOES_KEY, transacoes);
  }

  private novaTransacao(
    usuarioId: string,
    tipo: TipoTransacao,
    valor: number,
    descricao: string,
    extra?: Pick<Transacao, 'cpfDestino' | 'cpfOrigem'>
  ): Transacao {
    return {
      id: gerarId(),
      usuarioId,
      tipo,
      valor,
      descricao,
      criadoEm: new Date().toISOString(),
      ...extra,
    };
  }

  listarDoUsuario(usuarioId: string): Transacao[] {
    return this.getTransacoes()
      .filter((t) => t.usuarioId === usuarioId)
      .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  }

  depositar(valor: number): { ok: true } | { ok: false; mensagem: string } {
    const usuario = this.auth.getUsuarioLogado();
    if (!usuario) {
      return { ok: false, mensagem: 'Faça login para continuar.' };
    }
    if (!valor || valor <= 0) {
      return { ok: false, mensagem: 'Informe um valor maior que zero.' };
    }

    usuario.saldo = Math.round((usuario.saldo + valor) * 100) / 100;
    this.auth.atualizarUsuario(usuario);

    const transacoes = this.getTransacoes();
    transacoes.push(
      this.novaTransacao(usuario.id, 'deposito', valor, 'Depósito em conta')
    );
    this.saveTransacoes(transacoes);
    return { ok: true };
  }

  sacar(valor: number): { ok: true } | { ok: false; mensagem: string } {
    const usuario = this.auth.getUsuarioLogado();
    if (!usuario) {
      return { ok: false, mensagem: 'Faça login para continuar.' };
    }
    if (!valor || valor <= 0) {
      return { ok: false, mensagem: 'Informe um valor maior que zero.' };
    }
    if (valor > usuario.saldo) {
      return { ok: false, mensagem: 'Saldo insuficiente.' };
    }

    usuario.saldo = Math.round((usuario.saldo - valor) * 100) / 100;
    this.auth.atualizarUsuario(usuario);

    const transacoes = this.getTransacoes();
    transacoes.push(this.novaTransacao(usuario.id, 'saque', valor, 'Saque em conta'));
    this.saveTransacoes(transacoes);
    return { ok: true };
  }

  transferir(
    cpfDestino: string,
    valor: number
  ): { ok: true } | { ok: false; mensagem: string } {
    const remetente = this.auth.getUsuarioLogado();
    if (!remetente) {
      return { ok: false, mensagem: 'Faça login para continuar.' };
    }
    if (!valor || valor <= 0) {
      return { ok: false, mensagem: 'Informe um valor maior que zero.' };
    }
    if (valor > remetente.saldo) {
      return { ok: false, mensagem: 'Saldo insuficiente.' };
    }

    const cpf = limparCpf(cpfDestino);
    if (cpf === remetente.cpf) {
      return { ok: false, mensagem: 'Não é possível transferir para a própria conta.' };
    }

    const usuarios = this.storage.get<Usuario[]>('sopbank:usuarios') ?? [];
    const destinatario = usuarios.find((u) => u.cpf === cpf);
    if (!destinatario) {
      return { ok: false, mensagem: 'Conta de destino não encontrada.' };
    }

    remetente.saldo = Math.round((remetente.saldo - valor) * 100) / 100;
    destinatario.saldo = Math.round((destinatario.saldo + valor) * 100) / 100;
    this.auth.atualizarUsuario(remetente);

    const atualizados = usuarios.map((u) => {
      if (u.id === destinatario.id) {
        return destinatario;
      }
      if (u.id === remetente.id) {
        return remetente;
      }
      return u;
    });
    this.storage.set('sopbank:usuarios', atualizados);

    const transacoes = this.getTransacoes();
    transacoes.push(
      this.novaTransacao(remetente.id, 'transferencia_enviada', valor, `Transferência para ${destinatario.nome}`, {
        cpfDestino: destinatario.cpf,
      }),
      this.novaTransacao(destinatario.id, 'transferencia_recebida', valor, `Transferência de ${remetente.nome}`, {
        cpfOrigem: remetente.cpf,
      })
    );
    this.saveTransacoes(transacoes);
    return { ok: true };
  }
}
