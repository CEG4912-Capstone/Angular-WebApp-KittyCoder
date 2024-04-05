import {ChangeDetectorRef, Component, Renderer2} from '@angular/core';
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
import {MatChipGrid} from "@angular/material/chips";
import {error} from "@angular/compiler-cli/src/transformers/util";
import {Subscription} from "rxjs";
import {AuthenticationService} from "../../services/authentication.service";
import {MatTooltip} from "@angular/material/tooltip";

interface IPrompt {
  id: number;
  text: string;
  steps: number;
  // Add properties for ball movement
  movementType: 'Move' | 'Turn';
  direction: 'Forward' | 'Backward' | 'Right' | 'Left';
}

// raspberry pi server url
const raspberryPiUrl = 'https://raspberrypi.local/api/execute';


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
    MatGridTile,
    MatChipGrid,
    MatTooltip
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
    {id: 1, text: 'Move forward', steps: 10, movementType: 'Move', direction: 'Forward'},
    {id: 2, text: 'Move backward', steps: 20, movementType: 'Move', direction: 'Backward'},
    {id: 3, text: 'Turn right', steps: 90, movementType: 'Turn', direction: 'Right'},
    {id: 4, text: 'Turn left', steps: 120, movementType: 'Turn', direction: 'Left'},
    // Add more prompts as needed
  ];

  codes: IPrompt[] = [
    //empty at first
  ];

  cardWidth: string = '467px'; // Default canvas width defined in server
  cardHeight: string = '400px'; // Default canvas height

  generatedImage: any;

  authenticated = false;
  private subscription: Subscription = new Subscription();

  constructor(private _snackBar: MatSnackBar, private http: HttpClient, private cdr: ChangeDetectorRef,private authService: AuthenticationService) {
  }

  ngOnInit(): void {
    this.resetCanvas();

    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        if(user){
          this.authenticated = true;
        }
      })
    );
  }

  handleStepsChange(prompt: IPrompt, newSteps: number): void {

    // update steps value in appropriate prompt
    prompt.steps = newSteps;
  }

  reset() {
    this.resetCanvas();
    this.codes.length = 0;
  }

  resetCanvas() {
    this.http.get('http://localhost:9000/api/reset-preview').subscribe({
      next: (data: any) => {
        console.log('image generated!')
        // Set the base64 image data received from the server
        this.generatedImage = 'data:image/png;base64,' + data.base64image;

        const image = new Image();

        image.onload = () => {

          // update preview card dimensions
          this.cardWidth = image.width + 'px';
          this.cardHeight = image.height + 'px';
          // trigger change
          this.cdr.detectChanges();
        };

        image.src = this.generatedImage;

      },
      error: (error) => {
        console.error('Error fetching image:', error);
        this._snackBar.open('Error fetching image.', 'Dismiss', {duration: 2000});
      }
    });
  }

  generateImage() {

    this.http.post<any>('http://localhost:9000/api/preview', this.codes).subscribe({
      next: (data) => {
        console.log('image generated!')
        // Set the base64 image data received from the server
        this.generatedImage = 'data:image/png;base64,' + data.base64image;

        const image = new Image();

        image.onload = () => {

          // update preview card dimensions
          this.cardWidth = image.width + 'px';
          this.cardHeight = image.height + 'px';

          // trigger change
          this.cdr.detectChanges();
        };

        image.src = this.generatedImage;
      },
      error: (error) => {
        console.error('Error fetching image:', error);
        this._snackBar.open('Error fetching image.', 'Dismiss', {duration: 2000});
      }
    });
  }

  cloneItemWithNewId(item: IPrompt): IPrompt {
    // Clone the item
    const clonedItem = { ...item };

    // Assign a new unique ID
    clonedItem.id = this.getNewUniqueId();

    return clonedItem;
  }

  getNewUniqueId(): number {
    // Generate a new unique ID
    // This is a simplistic approach; you might need something more robust depending on your app
    return Math.max(0, ...this.prompts.map(p => p.id)) + 1;
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

      // to fix input changes being replicated by all prompts
      // we clone the item with a new index
      const item = this.cloneItemWithNewId(event.container.data[event.previousIndex]);
      // insert the cloned item at the target index
      event.container.data.splice(event.currentIndex, 0, item);

      // remove the original item
      if (event.previousIndex >= event.currentIndex) {
        // adjust for the item just added
        event.container.data.splice(event.previousIndex - 1, 1);
      } else {
        event.container.data.splice(event.previousIndex, 1);
      }
    }

  }

  dropEdit(event: CdkDragDrop<IPrompt[]>): void {
    if (event.previousContainer === event.container) {

      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      // pop and push the same item to fix focus bug

        // Clone item
        const item = { ...event.container.data[event.currentIndex] };

        // Pop item
        const removedItem = event.container.data.splice(event.previousIndex, 1)[0];

        // Push cloned item
        event.container.data.splice(event.currentIndex, 0, item);


    } else {
      console.log("dropped in prompts");

      // removes item from list
      event.previousContainer.data.splice(event.previousIndex, 1)

    }
  }

  editPrompt(event: CdkDragDrop<IPrompt[]>, prompt: IPrompt) {
    this._snackBar.open(`Prompt #${prompt.text + prompt.steps} Updated`, 'Dismiss', {duration: 1000});
  }

  executeRobot(): void {

    this.http.post(raspberryPiUrl, this.codes).subscribe({
      next: (response) => {
        console.log('Robot execution started!', response);
        this._snackBar.open('Robot execution started!', 'Dismiss', {duration: 2000});
      },
      error: (error) => {
        console.error('Error executing robot commands:', error);
        this._snackBar.open('Error executing robot commands.', 'Dismiss', {duration: 2000});
      }
    });
  }
}
