import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotLoggedInDialogComponent } from './not-logged-in-dialog.component';

describe('LoginComponent', () => {
  let component: NotLoggedInDialogComponent;
  let fixture: ComponentFixture<NotLoggedInDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotLoggedInDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotLoggedInDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
