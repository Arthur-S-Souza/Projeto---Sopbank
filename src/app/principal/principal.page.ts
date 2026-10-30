import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController, ToastController } from '@ionic/angular';
import { Transacao } from '../models/transacao.model';
import { CarteiraResumo } from '../models/usuario.model';
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
  abaAtiva: 'operar' | 'pix' = 'operar';
  valorDeposito?: number;
  valorSaque?: number;
  valorTransferencia?: number;
  cpfDestino = '';
  chavePixDestino = '';
  valorPix?: number;
  novaChavePix = '';
  ultimasTransacoes: Transacao[] = [];
  resumo: CarteiraResumo = { entradas: 0, saidas: 0, total: 0 };
  carregando = false;

  constructor(
    private menu: MenuController,
    private auth: AuthService,
    private conta: ContaService,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ionViewWillEnter(): void {
    void this.atualizarDados();
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

  async onRefresh(event: CustomEvent): Promise<void> {
    await this.atualizarDados();
    (event.target as HTMLIonRefresherElement).complete();
  }

  async atualizarDados(): Promise<void> {
    if (!this.auth.isAutenticado()) {
      await this.router.navigate(['/login']);
      return;
    }
    this.carregando = true;
    const carteira = await this.conta.obterCarteira();
    this.carregando = false;
    if (carteira.ok === false) {
      await this.mostrarToast(carteira.mensagem, 'danger');
      return;
    }
    this.resumo = carteira.data.resumo;
    this.novaChavePix = carteira.data.chavePix;
    const usuario = this.auth.getUsuarioLogado();
    if (usuario) {
      this.ultimasTransacoes = await this.conta.listarDoUsuario(usuario.id);
      this.ultimasTransacoes = this.ultimasTransacoes.slice(0, 5);
    }
  }

  abrirMenu(): void {
    this.menu.enable(true, 'sopbank-menu');
    this.menu.open('sopbank-menu');
  }

  async depositar(): Promise<void> {
    const resultado = await this.conta.depositar(Number(this.valorDeposito));
    if (resultado.ok === false) {
      await this.mostrarToast(resultado.mensagem, 'danger');
      return;
    }
    this.valorDeposito = undefined;
    await this.atualizarDados();
    await this.mostrarToast('Depósito realizado.', 'success');
  }

  async sacar(): Promise<void> {
    const resultado = await this.conta.sacar(Number(this.valorSaque));
    if (resultado.ok === false) {
      await this.mostrarToast(resultado.mensagem, 'danger');
      return;
    }
    this.valorSaque = undefined;
    await this.atualizarDados();
    await this.mostrarToast('Saque realizado.', 'success');
  }

  async transferir(): Promise<void> {
    const resultado = await this.conta.transferir(this.cpfDestino, Number(this.valorTransferencia));
    if (resultado.ok === false) {
      await this.mostrarToast(resultado.mensagem, 'danger');
      return;
    }
    this.cpfDestino = '';
    this.valorTransferencia = undefined;
    await this.atualizarDados();
    await this.mostrarToast('Transferência enviada.', 'success');
  }

  async enviarPix(): Promise<void> {
    const resultado = await this.conta.enviarPix(this.chavePixDestino, Number(this.valorPix));
    if (resultado.ok === false) {
      await this.mostrarToast(resultado.mensagem, 'danger');
      return;
    }
    this.chavePixDestino = '';
    this.valorPix = undefined;
    await this.atualizarDados();
    await this.mostrarToast('Pix enviado.', 'success');
  }

  async salvarChavePix(): Promise<void> {
    const resultado = await this.conta.atualizarChavePix(this.novaChavePix);
    if (resultado.ok === false) {
      await this.mostrarToast(resultado.mensagem, 'danger');
      return;
    }
    await this.mostrarToast('Chave Pix atualizada.', 'success');
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
      pix_enviado: 'Pix enviado',
      pix_recebido: 'Pix recebido',
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
