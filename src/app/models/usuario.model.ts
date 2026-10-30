export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  saldo: number;
  criadoEm: string;
}

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
}

export interface Sessao {
  usuarioId: string;
  email: string;
}
