import { Component, OnInit } from '@angular/core';
import { Transacao } from '../models/transacao.model';
import { AuthService } from '../services/auth.service';
import { ContaService } from '../services/conta.service';
import { formatarMoeda } from '../utils/moeda.util';

@Component({
  selector: 'app-relatorio',
  templateUrl: './relatorio.page.html',
  styleUrls: ['./relatorio.page.scss'],
})
export class RelatorioPage implements OnInit {
  transacoes: Transacao[] = [];
  filtro = 'todas';
  transacoesFiltradas: Transacao[] = [];
  carregando = false;

  constructor(private auth: AuthService, private conta: ContaService) {}

  ngOnInit(): void {
    void this.carregar();
  }

  ionViewWillEnter(): void {
    void this.carregar();
  }

  async carregar(): Promise<void> {
    const usuario = this.auth.getUsuarioLogado();
    if (!usuario) {
      this.transacoes = [];
      this.transacoesFiltradas = [];
      return;
    }
    this.carregando = true;
    this.transacoes = await this.conta.listarDoUsuario(usuario.id, this.filtro);
    this.carregando = false;
    this.transacoesFiltradas = this.transacoes;
  }

  async aplicarFiltro(): Promise<void> {
    await this.carregar();
  }

  formatarValor(tipo: Transacao['tipo'], valor: number): string {
    const sinal =
      tipo === 'saque' || tipo === 'transferencia_enviada' || tipo === 'pix_enviado' ? '-' : '+';
    return `${sinal} ${formatarMoeda(valor)}`;
  }

  rotuloTipo(tipo: Transacao['tipo']): string {
    const map: Record<Transacao['tipo'], string> = {
      deposito: 'Depósito',
      saque: 'Saque',
      transferencia_enviada: 'Transferência enviada',
      transferencia_recebida: 'Transferência recebida',
      pix_enviado: 'Pix enviado',
      pix_recebido: 'Pix recebido',
    };
    return map[tipo];
  }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR');
  }
}
