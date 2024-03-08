import { Component } from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, DragDropModule, transferArrayItem} from "@angular/cdk/drag-drop";
import {NgForOf, NgStyle} from "@angular/common";
import {DraggablePromptsComponent} from "./draggable-prompts/draggable-prompts.component";
import {MatCard, MatCardTitle, MatCardTitleGroup} from "@angular/material/card";
import {MatSnackBar} from "@angular/material/snack-bar";
import {animate, transition, trigger} from "@angular/animations";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";

interface IPrompt {
  text: string;
  steps: number;
  // Add properties for ball movement
  movementType: 'Move' | 'Turn';
  direction: 'Forward' | 'Backward' | 'Right' | 'Left';
}

@Component({
  selector: 'app-blockcode',
  standalone: true,
  imports: [
    CdkDropList,
    NgForOf,
    CdkDrag,
    DragDropModule,
    DraggablePromptsComponent,
    MatCard,
    MatCardTitleGroup,
    MatCardTitle,
    NgStyle,
    MatButton,
    MatIcon
  ],
  templateUrl: './blockcode.component.html',
  styleUrl: './blockcode.component.css',
  animations: [
    trigger('moveBall', [
      transition('* => *', animate('5s linear'))
    ])
  ]
})
export class BlockcodeComponent {
  prompts: IPrompt[] = [
    { text: 'Move forward', steps: 10, movementType: 'Move', direction: 'Forward' },
    { text: 'Move backward', steps: 20, movementType: 'Move', direction: 'Backward' },
    { text: 'Turn right', steps: 3, movementType: 'Turn', direction: 'Right' },
    { text: 'Turn left', steps: 5, movementType: 'Turn', direction: 'Left' },
    // Add more prompts as needed
  ];

  codes: IPrompt[] = [
    //empty at first
  ];
  showEmpty: boolean = false;

  constructor(private _snackBar: MatSnackBar) {
  }


  drop(event: CdkDragDrop<IPrompt[]>): void {
    if (event.previousContainer === event.container) {
      return;
    }
    if (!event.container.data || !event.previousContainer.data) {
      return;
    }
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    this.showEmpty = true;
  }

  editPrompt(event: CdkDragDrop<IPrompt[]>, prompt: IPrompt) {
      this._snackBar.open(`Prompt #${prompt.text + prompt.steps} Updated`, 'Dismiss', {duration:1000});
  }

  getBallPosition(): string {
    // Calculate the total distance traveled by the ball
    const totalDistance = this.codes.reduce((acc, prompt) => acc + prompt.steps, 0);

    // Determine the position of the ball based on the total distance
    const percentage = totalDistance > 100 ? 100 : totalDistance; // Limit to 100%
    return `${percentage}%`;
  }

  getBallStyle(): any {
    return {
      left: this.getBallPosition(),
    };
  }
}
