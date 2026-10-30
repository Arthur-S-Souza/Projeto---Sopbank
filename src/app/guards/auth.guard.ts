import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean | UrlTree> {
    if (!this.auth.isAutenticado()) {
      return this.router.parseUrl('/login');
    }
    if (!this.auth.getUsuarioLogado()) {
      const perfil = await this.auth.carregarPerfil();
      if (perfil.ok === false) {
        return this.router.parseUrl('/login');
      }
    }
    return true;
  }
}
