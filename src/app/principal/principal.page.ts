import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController, ToastController } from '@ionic/angular';
import { Transacao } from '../models/transacao.model';
import { AuthService } from '../services/auth.service';
import { ContaService } from '../services/conta.service';
import { formatarCpf } from '../utils/cpf.util';
import { formatarMoeda } from '../utils/moeda.util';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
})
export class PrincipalPage {
  valorDeposito?: number;
  valorSaque?: number;
  valorTransferencia?: number;
  cpfDestino = '';
  ultimasTransacoes: Transacao[] = [];

  constructor(
    private menu: MenuController,
    private auth: AuthService,
    private conta: ContaService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ionViewWillEnter(): void {
    if (!this.auth.isAutenticado()) {
      this.router.navigate(['/login']);
      return;
    }
    this.atualizarDados();
  }

  get usuario() {
    return this.auth.getUsuarioLogado();
  }

  get saldoFormatado(): string {
    return formatarMoeda(this.usuario?.saldo ?? 0);
  }

  get cpfFormatado(): string {
    return this.usuario ? formatarCpf(this.usuario.cpf) : '';
  }

  atualizarDados(): void {
    const usuario = this.usuario;
    if (!usuario) {
      return;
    }
    this.ultimasTransacoes = this.conta.listarDoUsuario(usuario.id).slice(0, 5);
  }

  abrirMenu(): void {
    this.menu.enable(true, 'sopbank-menu');
    this.menu.open('sopbank-menu');
  }

  async depositar(): Promise<void> {
    const resultado = this.conta.depositar(Number(this.valorDeposito));
    if (resultado.ok === false) {
      await this.mostrarToast(resultado.mensagem, 'danger');
      return;
    }
    this.valorDeposito = undefined;
    this.atualizarDados();
    await this.mostrarToast('Depósito realizado.', 'success');
  }

  async sacar(): Promise<void> {
    const resultado = this.conta.sacar(Number(this.valorSaque));
    if (resultado.ok === false) {
      await this.mostrarToast(resultado.mensagem, 'danger');
      return;
    }
    this.valorSaque = undefined;
    this.atualizarDados();
    await this.mostrarToast('Saque realizado.', 'success');
  }

  async transferir(): Promise<void> {
    const resultado = this.conta.transferir(this.cpfDestino, Number(this.valorTransferencia));
    if (resultado.ok === false) {
      await this.mostrarToast(resultado.mensagem, 'danger');
      return;
    }
    this.cpfDestino = '';
    this.valorTransferencia = undefined;
    this.atualizarDados();
    await this.mostrarToast('Transferência enviada.', 'success');
  }

  async confirmarLogout(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Sair',
      message: 'Deseja encerrar sua sessão?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sair',
          role: 'destructive',
          handler: () => this.auth.logout(),
        },
      ],
    });
    await alert.present();
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

  private async mostrarToast(mensagem: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2500,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
