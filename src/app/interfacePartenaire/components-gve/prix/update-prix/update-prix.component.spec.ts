import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePrixComponent } from './update-prix.component';

describe('UpdatePrixComponent', () => {
  let component: UpdatePrixComponent;
  let fixture: ComponentFixture<UpdatePrixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdatePrixComponent]
    });
    fixture = TestBed.createComponent(UpdatePrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
