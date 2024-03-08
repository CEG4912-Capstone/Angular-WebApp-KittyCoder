import {Component, Input} from '@angular/core';
import {CdkDrag} from "@angular/cdk/drag-drop";
import {NgForOf} from "@angular/common";
import {MatButton} from "@angular/material/button";

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
    MatButton
  ],
  templateUrl: './draggable-prompts.component.html',
  styleUrl: './draggable-prompts.component.css'
})
export class DraggablePromptsComponent {

  @Input()
  prompt: IPrompt | undefined;
}
