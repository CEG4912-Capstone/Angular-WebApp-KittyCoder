import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraggablePromptsComponent } from './draggable-prompts.component';

describe('DraggablePromptsComponent', () => {
  let component: DraggablePromptsComponent;
  let fixture: ComponentFixture<DraggablePromptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraggablePromptsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DraggablePromptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
