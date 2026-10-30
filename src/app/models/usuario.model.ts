export interface Usuario {
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

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
}

export interface CarteiraResumo {
  entradas: number;
  saidas: number;
  total: number;
}

export interface Carteira extends Usuario {
  resumo: CarteiraResumo;
}

export type Resultado<T = void> = { ok: true; data?: T } | { ok: false; mensagem: string };
