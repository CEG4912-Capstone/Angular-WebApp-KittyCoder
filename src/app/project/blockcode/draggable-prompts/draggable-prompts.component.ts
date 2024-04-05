import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, copyArrayItem, moveItemInArray} from "@angular/cdk/drag-drop";
import {NgForOf, NgIf, NgStyle} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatCard} from "@angular/material/card";
import {FormsModule} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";

interface IPrompt {
  id: number;
  text: string;
  steps:number;
}

@Component({
  selector: 'app-draggable-prompts',
  standalone: true,
  imports: [
    CdkDrag,
    NgForOf,
    MatButton,
    CdkDropList,
    MatCard,
    NgStyle,
    FormsModule,
    NgIf
  ],
  templateUrl: './draggable-prompts.component.html',
  styleUrl: './draggable-prompts.component.css'
})
export class DraggablePromptsComponent {

  @Input()
  prompt: IPrompt | undefined;

  @Output()
  stepsChange = new EventEmitter<number>(); // Emits the new steps value

  constructor(private _snackBar: MatSnackBar) {
  }


  updateSteps(newSteps: string) {
    const steps = parseInt(newSteps, 10);
    console.log(steps)
    if (!isNaN(steps)) {
      this.stepsChange.emit(steps); // Emit the steps to block code component
    }
  }

}
