import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeVehiculeComponent } from './type-vehicule.component';

describe('TypeVehiculeComponent', () => {
  let component: TypeVehiculeComponent;
  let fixture: ComponentFixture<TypeVehiculeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TypeVehiculeComponent]
    });
    fixture = TestBed.createComponent(TypeVehiculeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
