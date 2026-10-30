import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule } from '@ionic/angular';

import { CadastroPage } from './cadastro.page';

describe('CadastroPage', () => {
  let component: CadastroPage;
  let fixture: ComponentFixture<CadastroPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CadastroPage],
      imports: [IonicModule.forRoot(), RouterTestingModule, FormsModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
