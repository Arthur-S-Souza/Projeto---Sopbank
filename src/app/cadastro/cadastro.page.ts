import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
})
export class CadastroPage {
  nome = '';
  email = '';
  senha = '';
  telefone = '';
  cpf = '';
  dataNascimento = '';
  carregando = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async cadastrar(): Promise<void> {
    this.carregando = true;
    const resultado = await this.auth.cadastrar({
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      telefone: this.telefone,
      cpf: this.cpf,
      dataNascimento: this.dataNascimento,
    });
    this.carregando = false;

    if (resultado.ok === false) {
      await this.mostrarToast(resultado.mensagem, 'danger');
      return;
    }

    await this.mostrarToast('Carteira criada com sucesso!', 'success');
    await this.router.navigate(['/principal']);
  }

  private async mostrarToast(mensagem: string, color: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: mensagem,
      duration: 2800,
      color,
      position: 'top',
    });
    await toast.present();
  }
}
