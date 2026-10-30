import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';

import { RelatorioPage } from './relatorio.page';

describe('RelatorioPage', () => {
  let component: RelatorioPage;
  let fixture: ComponentFixture<RelatorioPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatorioPage ],
      imports: [IonicModule.forRoot(), RouterTestingModule.withRoutes([]), FormsModule, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(RelatorioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
