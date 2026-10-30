import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { RelatorioPage } from './relatorio.page';
import { AuthService } from '../services/auth.service';
import { ContaService } from '../services/conta.service';

describe('RelatorioPage', () => {
  let component: RelatorioPage;
  let fixture: ComponentFixture<RelatorioPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatorioPage ],
      imports: [IonicModule.forRoot(), RouterTestingModule.withRoutes([]), FormsModule],
      providers: [
        {
          provide: AuthService,
          useValue: { getUsuarioLogado: () => ({ id: '1' }) },
        },
        {
          provide: ContaService,
          useValue: { listarDoUsuario: () => [] },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatorioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
