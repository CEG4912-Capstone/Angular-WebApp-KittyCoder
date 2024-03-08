import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockcodeComponent } from './blockcode.component';

describe('BlockcodeComponent', () => {
  let component: BlockcodeComponent;
  let fixture: ComponentFixture<BlockcodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlockcodeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BlockcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
