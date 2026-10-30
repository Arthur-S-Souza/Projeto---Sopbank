export type TipoTransacao =
  | 'deposito'
  | 'saque'
  | 'transferencia_enviada'
  | 'transferencia_recebida'
  | 'pix_enviado'
  | 'pix_recebido';

export interface UsuarioRow {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  telefone: string;
  cpf: string;
  data_nascimento: string;
  saldo: number;
  chave_pix: string;
  criado_em: string;
}

export interface UsuarioPublico {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  saldo: number;
  chavePix: string;
  criadoEm: string;
}

export interface TransacaoRow {
  id: string;
  user_id: string;
  tipo: TipoTransacao;
  valor: number;
  descricao: string;
  cpf_destino: string | null;
  cpf_origem: string | null;
  chave_pix: string | null;
  criado_em: string;
}

export interface TransacaoPublica {
  id: string;
  usuarioId: string;
  tipo: TipoTransacao;
  valor: number;
  descricao: string;
  cpfDestino?: string;
  cpfOrigem?: string;
  chavePix?: string;
  criadoEm: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}
