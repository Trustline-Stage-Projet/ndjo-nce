import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirementBancaireComponent } from './virement-bancaire.component';

describe('VirementBancaireComponent', () => {
  let component: VirementBancaireComponent;
  let fixture: ComponentFixture<VirementBancaireComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VirementBancaireComponent]
    });
    fixture = TestBed.createComponent(VirementBancaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
