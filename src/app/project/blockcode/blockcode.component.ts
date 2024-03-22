import { Component } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList, copyArrayItem,
  DragDropModule,
  moveItemInArray,
  transferArrayItem
} from "@angular/cdk/drag-drop";
import {NgForOf, NgOptimizedImage, NgStyle} from "@angular/common";
import {DraggablePromptsComponent} from "./draggable-prompts/draggable-prompts.component";
import {MatCard, MatCardTitle, MatCardTitleGroup} from "@angular/material/card";
import {MatSnackBar} from "@angular/material/snack-bar";
import {animate, transition, trigger} from "@angular/animations";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {HttpClient} from "@angular/common/http";
import {MatGridTile} from "@angular/material/grid-list";

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
    MatIcon,
    NgOptimizedImage,
    MatGridTile
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
  generatedImage: string | ArrayBuffer | null = null;

  constructor(private _snackBar: MatSnackBar, private http: HttpClient) {
  }

  noReturn() {
    return false;
  }

  generateImage() {
    // Send a POST request to your Express server
    this.http.post<any>('http://localhost:9000/api/preview', null)
      .subscribe(
        (data) => {
          console.log('image generated!')
          // Set the base64 image data received from the server
          this.generatedImage = 'data:image/png;base64,' + data.base64image;
        },
        (error) => {
          console.error('Error fetching image:', error);
        }
      );
  }

  dropList(event: CdkDragDrop<IPrompt[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      copyArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }

  }

  dropEdit(event: CdkDragDrop<IPrompt[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      console.log("dropped in prompts")

      // removes item from list
      event.previousContainer.data.splice(event.previousIndex, 1)
    }

  }

  editPrompt(event: CdkDragDrop<IPrompt[]>, prompt: IPrompt) {
      this._snackBar.open(`Prompt #${prompt.text + prompt.steps} Updated`, 'Dismiss', {duration:1000});
  }

}
