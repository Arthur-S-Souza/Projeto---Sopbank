import { getDb } from '../db/database';
import { TransacaoPublica, TransacaoRow, UsuarioPublico, UsuarioRow } from '../types';

function mapUsuario(row: UsuarioRow): UsuarioPublico {
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    telefone: row.telefone,
    cpf: row.cpf,
    dataNascimento: row.data_nascimento,
    saldo: row.saldo,
    chavePix: row.chave_pix,
    criadoEm: row.criado_em,
  };
}

function mapTransacao(row: TransacaoRow): TransacaoPublica {
  return {
    id: row.id,
    usuarioId: row.user_id,
    tipo: row.tipo,
    valor: row.valor,
    descricao: row.descricao,
    cpfDestino: row.cpf_destino ?? undefined,
    cpfOrigem: row.cpf_origem ?? undefined,
    chavePix: row.chave_pix ?? undefined,
    criadoEm: row.criado_em,
  };
}

export class UserRepository {
  findById(id: string): UsuarioRow | undefined {
    return getDb()
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(id) as UsuarioRow | undefined;
  }

  findPublicById(id: string): UsuarioPublico | null {
    const row = this.findById(id);
    return row ? mapUsuario(row) : null;
  }

  findByEmail(email: string): UsuarioRow | undefined {
    return getDb()
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(email) as UsuarioRow | undefined;
  }

  findByCpf(cpf: string): UsuarioRow | undefined {
    return getDb()
      .prepare('SELECT * FROM users WHERE cpf = ?')
      .get(cpf) as UsuarioRow | undefined;
  }

  findByPixKey(chave: string): UsuarioRow | undefined {
    return getDb()
      .prepare('SELECT * FROM users WHERE chave_pix = ?')
      .get(chave) as UsuarioRow | undefined;
  }

  create(user: UsuarioRow): UsuarioPublico {
    getDb()
      .prepare(
        `INSERT INTO users (id, nome, email, senha_hash, telefone, cpf, data_nascimento, saldo, chave_pix, criado_em)
         VALUES (@id, @nome, @email, @senha_hash, @telefone, @cpf, @data_nascimento, @saldo, @chave_pix, @criado_em)`
      )
      .run(user);
    return mapUsuario(user);
  }

  updateSaldo(id: string, saldo: number): void {
    getDb().prepare('UPDATE users SET saldo = ? WHERE id = ?').run(saldo, id);
  }

  updatePixKey(id: string, chave: string): void {
    getDb().prepare('UPDATE users SET chave_pix = ? WHERE id = ?').run(chave, id);
  }
}

export class TransactionRepository {
  create(tx: TransacaoRow): TransacaoPublica {
    getDb()
      .prepare(
        `INSERT INTO transactions (id, user_id, tipo, valor, descricao, cpf_destino, cpf_origem, chave_pix, criado_em)
         VALUES (@id, @user_id, @tipo, @valor, @descricao, @cpf_destino, @cpf_origem, @chave_pix, @criado_em)`
      )
      .run(tx);
    return mapTransacao(tx);
  }

  listByUser(userId: string, tipo?: string): TransacaoPublica[] {
    if (tipo && tipo !== 'todas') {
      const rows = getDb()
        .prepare(
          `SELECT * FROM transactions WHERE user_id = ? AND tipo = ? ORDER BY criado_em DESC LIMIT 200`
        )
        .all(userId, tipo) as TransacaoRow[];
      return rows.map(mapTransacao);
    }

    const rows = getDb()
      .prepare(`SELECT * FROM transactions WHERE user_id = ? ORDER BY criado_em DESC LIMIT 200`)
      .all(userId) as TransacaoRow[];
    return rows.map(mapTransacao);
  }

  summary(userId: string): { entradas: number; saidas: number; total: number } {
    const rows = getDb()
      .prepare(`SELECT tipo, valor FROM transactions WHERE user_id = ?`)
      .all(userId) as { tipo: string; valor: number }[];

    let entradas = 0;
    let saidas = 0;
    for (const row of rows) {
      if (['deposito', 'transferencia_recebida', 'pix_recebido'].includes(row.tipo)) {
        entradas += row.valor;
      } else {
        saidas += row.valor;
      }
    }
    return { entradas, saidas, total: rows.length };
  }
}

export const userRepository = new UserRepository();
export const transactionRepository = new TransactionRepository();
