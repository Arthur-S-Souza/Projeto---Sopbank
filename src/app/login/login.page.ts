import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = '';
  senha = '';
  carregando = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastCtrl: ToastController
  ) {}

  async entrar(): Promise<void> {
    this.carregando = true;
    const resultado = await this.auth.login(this.email, this.senha);
    this.carregando = false;
    if (resultado.ok === false) {
      await this.mostrarToast(resultado.mensagem, 'danger');
      return;
    }
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
