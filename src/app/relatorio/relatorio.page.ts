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

  constructor(private auth: AuthService, private conta: ContaService) {}

  ngOnInit(): void {
    this.carregar();
  }

  ionViewWillEnter(): void {
    this.carregar();
  }

  carregar(): void {
    const usuario = this.auth.getUsuarioLogado();
    if (!usuario) {
      this.transacoes = [];
      return;
    }
    this.transacoes = this.conta.listarDoUsuario(usuario.id);
    this.aplicarFiltro();
  }

  transacoesFiltradas: Transacao[] = [];

  aplicarFiltro(): void {
    if (this.filtro === 'todas') {
      this.transacoesFiltradas = this.transacoes;
      return;
    }
    this.transacoesFiltradas = this.transacoes.filter((t) => t.tipo === this.filtro);
  }

  formatarValor(tipo: Transacao['tipo'], valor: number): string {
    const sinal =
      tipo === 'saque' || tipo === 'transferencia_enviada' ? '-' : '+';
    return `${sinal} ${formatarMoeda(valor)}`;
  }

  rotuloTipo(tipo: Transacao['tipo']): string {
    const map: Record<Transacao['tipo'], string> = {
      deposito: 'Depósito',
      saque: 'Saque',
      transferencia_enviada: 'Transferência enviada',
      transferencia_recebida: 'Transferência recebida',
    };
    return map[tipo];
  }

  formatarData(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR');
  }
}
