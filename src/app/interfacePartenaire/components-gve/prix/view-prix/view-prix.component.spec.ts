import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPrixComponent } from './view-prix.component';

describe('ViewPrixComponent', () => {
  let component: ViewPrixComponent;
  let fixture: ComponentFixture<ViewPrixComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewPrixComponent]
    });
    fixture = TestBed.createComponent(ViewPrixComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
