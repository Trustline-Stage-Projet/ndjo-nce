import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateChauffeursComponent } from './update-chauffeurs.component';

describe('UpdateChauffeursComponent', () => {
  let component: UpdateChauffeursComponent;
  let fixture: ComponentFixture<UpdateChauffeursComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateChauffeursComponent]
    });
    fixture = TestBed.createComponent(UpdateChauffeursComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
