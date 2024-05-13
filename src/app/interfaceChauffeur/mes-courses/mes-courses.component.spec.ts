import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MesCoursesComponent } from './mes-courses.component';

describe('MesCoursesComponent', () => {
  let component: MesCoursesComponent;
  let fixture: ComponentFixture<MesCoursesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MesCoursesComponent]
    });
    fixture = TestBed.createComponent(MesCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
