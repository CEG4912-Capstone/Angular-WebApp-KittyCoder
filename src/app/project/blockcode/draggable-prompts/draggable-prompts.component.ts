import {Component, Input} from '@angular/core';
import {CdkDrag, CdkDragDrop, CdkDropList, copyArrayItem, moveItemInArray} from "@angular/cdk/drag-drop";
import {NgForOf, NgStyle} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatCard} from "@angular/material/card";

interface IPrompt {
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
    NgStyle
  ],
  templateUrl: './draggable-prompts.component.html',
  styleUrl: './draggable-prompts.component.css'
})
export class DraggablePromptsComponent {

  @Input()
  prompt: IPrompt | undefined;

  @Input()
  i:any;

}
