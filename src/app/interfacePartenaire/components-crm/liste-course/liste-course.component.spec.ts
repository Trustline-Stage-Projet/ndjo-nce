import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeCourseComponent } from './liste-course.component';

describe('ListeCourseComponent', () => {
  let component: ListeCourseComponent;
  let fixture: ComponentFixture<ListeCourseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListeCourseComponent]
    });
    fixture = TestBed.createComponent(ListeCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
