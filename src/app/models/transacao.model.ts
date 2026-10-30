export type TipoTransacao =
  | 'deposito'
  | 'saque'
  | 'transferencia_enviada'
  | 'transferencia_recebida';

export interface Transacao {
  id: string;
  usuarioId: string;
  tipo: TipoTransacao;
  valor: number;
  descricao: string;
  criadoEm: string;
  cpfDestino?: string;
  cpfOrigem?: string;
}
