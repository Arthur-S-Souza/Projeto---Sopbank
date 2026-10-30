import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { transactionRepository, userRepository } from '../repositories';
import { JwtPayload, TipoTransacao, TransacaoRow, UsuarioRow } from '../types';
import { cpfValido, limparCpf } from '../utils/cpf';
import { arredondarMoeda } from '../utils/money';
import { getDb } from '../db/database';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export class AuthService {
  signToken(userId: string, email: string): string {
    return jwt.sign({ sub: userId, email }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.jwtSecret) as JwtPayload;
    } catch {
      throw new HttpError(401, 'Token inválido ou expirado.');
    }
  }

  async register(input: {
    nome: string;
    email: string;
    senha: string;
    telefone: string;
    cpf: string;
    dataNascimento: string;
  }) {
    const nome = input.nome?.trim();
    const email = input.email?.trim().toLowerCase();
    const senha = input.senha?.trim();
    const telefone = input.telefone?.trim();
    const cpf = limparCpf(input.cpf);
    const dataNascimento = input.dataNascimento?.trim();

    if (!nome || nome.length < 3) {
      throw new HttpError(400, 'Informe seu nome completo.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new HttpError(400, 'Informe um e-mail válido.');
    }
    if (!senha || senha.length < 6) {
      throw new HttpError(400, 'A senha deve ter pelo menos 6 caracteres.');
    }
    if (!telefone || limparCpf(telefone).length < 10) {
      throw new HttpError(400, 'Informe um telefone válido.');
    }
    if (!cpfValido(cpf)) {
      throw new HttpError(400, 'CPF inválido.');
    }
    if (!dataNascimento) {
      throw new HttpError(400, 'Informe a data de nascimento.');
    }
    if (userRepository.findByEmail(email)) {
      throw new HttpError(409, 'Este e-mail já está cadastrado.');
    }
    if (userRepository.findByCpf(cpf)) {
      throw new HttpError(409, 'Este CPF já está cadastrado.');
    }

    const id = uuidv4();
    const senhaHash = await bcrypt.hash(senha, 10);
    const chavePix = email;

    const user: UsuarioRow = {
      id,
      nome,
      email,
      senha_hash: senhaHash,
      telefone,
      cpf,
      data_nascimento: dataNascimento,
      saldo: 0,
      chave_pix: chavePix,
      criado_em: new Date().toISOString(),
    };

    const created = userRepository.create(user);
    const token = this.signToken(id, email);
    return { token, usuario: created };
  }

  async login(email: string, senha: string) {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedSenha = senha?.trim();
    if (!normalizedEmail || !normalizedSenha) {
      throw new HttpError(400, 'Preencha e-mail e senha.');
    }

    const user = userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw new HttpError(401, 'E-mail ou senha incorretos.');
    }

    const ok = await bcrypt.compare(normalizedSenha, user.senha_hash);
    if (!ok) {
      throw new HttpError(401, 'E-mail ou senha incorretos.');
    }

    const token = this.signToken(user.id, user.email);
    return { token, usuario: userRepository.findPublicById(user.id)! };
  }

  me(userId: string) {
    const user = userRepository.findPublicById(userId);
    if (!user) {
      throw new HttpError(404, 'Usuário não encontrado.');
    }
    return user;
  }
}

export class WalletService {
  private insertTx(
    userId: string,
    tipo: TipoTransacao,
    valor: number,
    descricao: string,
    extra?: Partial<Pick<TransacaoRow, 'cpf_destino' | 'cpf_origem' | 'chave_pix'>>
  ) {
    const tx: TransacaoRow = {
      id: uuidv4(),
      user_id: userId,
      tipo,
      valor: arredondarMoeda(valor),
      descricao,
      cpf_destino: extra?.cpf_destino ?? null,
      cpf_origem: extra?.cpf_origem ?? null,
      chave_pix: extra?.chave_pix ?? null,
      criado_em: new Date().toISOString(),
    };
    return transactionRepository.create(tx);
  }

  getWallet(userId: string) {
    const user = userRepository.findPublicById(userId);
    if (!user) {
      throw new HttpError(404, 'Usuário não encontrado.');
    }
    const summary = transactionRepository.summary(userId);
    return { ...user, resumo: summary };
  }

  deposit(userId: string, valor: number) {
    if (!valor || valor <= 0) {
      throw new HttpError(400, 'Informe um valor maior que zero.');
    }
    const user = userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'Usuário não encontrado.');
    }

    const novoSaldo = arredondarMoeda(user.saldo + valor);
    userRepository.updateSaldo(userId, novoSaldo);
    const tx = this.insertTx(userId, 'deposito', valor, 'Depósito na carteira');
    return { saldo: novoSaldo, transacao: tx };
  }

  withdraw(userId: string, valor: number) {
    if (!valor || valor <= 0) {
      throw new HttpError(400, 'Informe um valor maior que zero.');
    }
    const user = userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'Usuário não encontrado.');
    }
    if (valor > user.saldo) {
      throw new HttpError(400, 'Saldo insuficiente.');
    }

    const novoSaldo = arredondarMoeda(user.saldo - valor);
    userRepository.updateSaldo(userId, novoSaldo);
    const tx = this.insertTx(userId, 'saque', valor, 'Saque da carteira');
    return { saldo: novoSaldo, transacao: tx };
  }

  transfer(userId: string, cpfDestino: string, valor: number) {
    if (!valor || valor <= 0) {
      throw new HttpError(400, 'Informe um valor maior que zero.');
    }

    const cpf = limparCpf(cpfDestino);
    const remetente = userRepository.findById(userId);
    if (!remetente) {
      throw new HttpError(404, 'Usuário não encontrado.');
    }
    if (cpf === remetente.cpf) {
      throw new HttpError(400, 'Não é possível transferir para a própria conta.');
    }
    if (valor > remetente.saldo) {
      throw new HttpError(400, 'Saldo insuficiente.');
    }

    const destinatario = userRepository.findByCpf(cpf);
    if (!destinatario) {
      throw new HttpError(404, 'Conta de destino não encontrada.');
    }

    const db = getDb();
    const run = db.transaction(() => {
      const novoRemetente = arredondarMoeda(remetente.saldo - valor);
      const novoDestinatario = arredondarMoeda(destinatario.saldo + valor);
      userRepository.updateSaldo(remetente.id, novoRemetente);
      userRepository.updateSaldo(destinatario.id, novoDestinatario);

      this.insertTx(remetente.id, 'transferencia_enviada', valor, `Transferência para ${destinatario.nome}`, {
        cpf_destino: destinatario.cpf,
      });
      this.insertTx(destinatario.id, 'transferencia_recebida', valor, `Transferência de ${remetente.nome}`, {
        cpf_origem: remetente.cpf,
      });

      return { saldo: novoRemetente };
    });

    return run();
  }

  pix(userId: string, chave: string, valor: number) {
    if (!valor || valor <= 0) {
      throw new HttpError(400, 'Informe um valor maior que zero.');
    }
    const chaveNormalizada = chave?.trim().toLowerCase();
    if (!chaveNormalizada) {
      throw new HttpError(400, 'Informe a chave Pix.');
    }

    const remetente = userRepository.findById(userId);
    if (!remetente) {
      throw new HttpError(404, 'Usuário não encontrado.');
    }
    if (valor > remetente.saldo) {
      throw new HttpError(400, 'Saldo insuficiente.');
    }

    const destinatario =
      userRepository.findByPixKey(chaveNormalizada) ??
      userRepository.findByEmail(chaveNormalizada) ??
      userRepository.findByCpf(limparCpf(chaveNormalizada));

    if (!destinatario) {
      throw new HttpError(404, 'Chave Pix não encontrada.');
    }
    if (destinatario.id === remetente.id) {
      throw new HttpError(400, 'Não é possível enviar Pix para você mesmo.');
    }

    const db = getDb();
    const run = db.transaction(() => {
      const novoRemetente = arredondarMoeda(remetente.saldo - valor);
      const novoDestinatario = arredondarMoeda(destinatario.saldo + valor);
      userRepository.updateSaldo(remetente.id, novoRemetente);
      userRepository.updateSaldo(destinatario.id, novoDestinatario);

      this.insertTx(remetente.id, 'pix_enviado', valor, `Pix enviado para ${destinatario.nome}`, {
        chave_pix: destinatario.chave_pix,
      });
      this.insertTx(destinatario.id, 'pix_recebido', valor, `Pix recebido de ${remetente.nome}`, {
        chave_pix: remetente.chave_pix,
      });

      return { saldo: novoRemetente };
    });

    return run();
  }

  updatePixKey(userId: string, novaChave: string) {
    const chave = novaChave?.trim().toLowerCase();
    if (!chave || chave.length < 3) {
      throw new HttpError(400, 'Chave Pix inválida.');
    }
    const existing = userRepository.findByPixKey(chave);
    if (existing && existing.id !== userId) {
      throw new HttpError(409, 'Esta chave Pix já está em uso.');
    }
    userRepository.updatePixKey(userId, chave);
    return userRepository.findPublicById(userId)!;
  }

  listTransactions(userId: string, tipo?: string) {
    return transactionRepository.listByUser(userId, tipo);
  }
}

export const authService = new AuthService();
export const walletService = new WalletService();
