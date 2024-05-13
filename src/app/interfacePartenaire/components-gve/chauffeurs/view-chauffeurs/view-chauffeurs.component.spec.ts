import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewChauffeursComponent } from './view-chauffeurs.component';

describe('ViewChauffeursComponent', () => {
  let component: ViewChauffeursComponent;
  let fixture: ComponentFixture<ViewChauffeursComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewChauffeursComponent]
    });
    fixture = TestBed.createComponent(ViewChauffeursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
