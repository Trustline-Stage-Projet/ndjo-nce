import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttributComponent } from './attribut.component';

describe('AttributComponent', () => {
  let component: AttributComponent;
  let fixture: ComponentFixture<AttributComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttributComponent]
    });
    fixture = TestBed.createComponent(AttributComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
