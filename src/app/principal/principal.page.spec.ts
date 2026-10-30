import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';

import { PrincipalPage } from './principal.page';
import { AuthService } from '../services/auth.service';
import { ContaService } from '../services/conta.service';

describe('PrincipalPage', () => {
  let component: PrincipalPage;
  let fixture: ComponentFixture<PrincipalPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PrincipalPage],
      imports: [IonicModule.forRoot(), RouterTestingModule, FormsModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAutenticado: () => true,
            getUsuarioLogado: () => ({
              id: '1',
              nome: 'Teste',
              email: 'teste@email.com',
              cpf: '52998224725',
              saldo: 100,
            }),
            logout: () => undefined,
          },
        },
        {
          provide: ContaService,
          useValue: { listarDoUsuario: () => [] },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PrincipalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
