import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';

import { CadastroPage } from './cadastro.page';
import { AuthService } from '../services/auth.service';

describe('CadastroPage', () => {
  let component: CadastroPage;
  let fixture: ComponentFixture<CadastroPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CadastroPage],
      imports: [IonicModule.forRoot(), RouterTestingModule, FormsModule],
      providers: [
        {
          provide: AuthService,
          useValue: { cadastrar: () => ({ ok: true }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
