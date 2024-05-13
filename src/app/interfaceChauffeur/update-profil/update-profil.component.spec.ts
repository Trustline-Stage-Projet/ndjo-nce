import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProfilComponent } from './update-profil.component';

describe('UpdateProfilComponent', () => {
  let component: UpdateProfilComponent;
  let fixture: ComponentFixture<UpdateProfilComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateProfilComponent]
    });
    fixture = TestBed.createComponent(UpdateProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
