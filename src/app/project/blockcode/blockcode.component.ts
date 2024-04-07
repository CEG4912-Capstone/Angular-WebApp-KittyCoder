import {ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild} from '@angular/core';
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
import {MatTab, MatTabGroup} from "@angular/material/tabs";

interface IPrompt {
  id: number;
  text: string;
  steps: number;
  movementType: 'Move' | 'Turn';
  direction: 'Forward' | 'Backward' | 'Right' | 'Left';
}

// esp32 server url
const robotUrl = 'http://192.168.2.212/post';

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
    MatTooltip,
    MatTabGroup,
    MatTab
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
        console.log('image generated!');
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
      // Just rearranging items in the same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Cloning an item to a new list
      const itemToClone = event.previousContainer.data[event.previousIndex];
      const clonedItem = this.cloneItemWithNewId(itemToClone);

      // Insert the cloned item into the target container's data array
      event.container.data.splice(event.currentIndex, 0, clonedItem);
    }
  }

  dropEdit(event: CdkDragDrop<IPrompt[]>): void {
    if (event.previousContainer === event.container) {

      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      // pop and push the same item to fix focus bug

        // Clone item
        // const item = { ...event.container.data[event.currentIndex] };
        //
        // // Pop item
        // const removedItem = event.container.data.splice(event.previousIndex, 1)[0];
        //
        // // Push cloned item
        // event.container.data.splice(event.currentIndex, 0, item);


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
    // make sure data sent is in json format
    const headers = { 'Content-Type': 'application/json' };
    console.log(this.codes)
    this.http.post(robotUrl,JSON.stringify(this.codes), { 'headers': headers }).subscribe({
      next: (response) => {
        console.log(response);
      },
      error: (error) => {
        console.error('Error executing robot commands:', error);
      }
    });
    // this.http.post(robotUrl, this.codes).subscribe({
    //   next: (response) => {
    //     console.log('Robot execution started!', response);
    //     this._snackBar.open('Robot execution started!', 'Dismiss', {duration: 2000});
    //   },
    //   error: (error) => {
    //     console.error('Error executing robot commands:', error);
    //     this._snackBar.open('Error executing robot commands.', 'Dismiss', {duration: 2000});
    //   }
    // });
  }

  drawSquare() {

    this.codes = [];

    const squareCommands: IPrompt[] = [
      { id: this.getNewUniqueId(), text: 'Move forward', steps: 10, movementType: 'Move', direction: 'Forward' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 90, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Move forward', steps: 10, movementType: 'Move', direction: 'Forward' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 90, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Move forward', steps: 10, movementType: 'Move', direction: 'Forward' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 90, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Move forward', steps: 10, movementType: 'Move', direction: 'Forward' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 90, movementType: 'Turn', direction: 'Right' }
    ];

    // Simulate adding each command block with a brief delay to animate
    squareCommands.forEach((command, index) => {
      setTimeout(() => {
        this.codes.push(command);
      }, index * 100); // Adjust delay as needed
    });
  }

  drawCircle() {

    this.codes = [];

    const circleCommands: IPrompt[] = [
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
      { id: this.getNewUniqueId(), text: 'Turn right', steps: 10, movementType: 'Turn', direction: 'Right' },
    ];

    // Simulate adding each command block with a brief delay to animate
    circleCommands.forEach((command, index) => {
      setTimeout(() => {
        this.codes.push(command);
      }, index * 100); // Adjust delay as needed
    });
  }


  @ViewChild('imageContainer') imageContainer: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('draggableImage') draggableImage: ElementRef<HTMLImageElement> | undefined;

  private isDragging = false;
  private startX = 0;
  private startY = 0;

  startDragging(event: MouseEvent) {
    event.preventDefault();
    this.isDragging = true;
    this.startX = event.clientX;
    this.startY = event.clientY;

    // Listen for mouse move and up events on the whole document
    document.addEventListener('mousemove', this.dragImage.bind(this));
    document.addEventListener('mouseup', this.stopDragging.bind(this));
  }

  dragImage(event: MouseEvent) {
    if (!this.isDragging) return;
    event.preventDefault();

    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;

    this.startX = event.clientX;
    this.startY = event.clientY;

    if(this.draggableImage) {
      const currentTransform = getComputedStyle(this.draggableImage.nativeElement).transform;


      // Handle case when transform is 'none'
      const matrix = currentTransform === 'none'
        ? [1, 0, 0, 1, 0, 0] // Identity matrix
        : currentTransform.slice(7, -1).split(', ').map(parseFloat);

      // Translate image
      matrix[4] += dx; // Translate X
      matrix[5] += dy; // Translate Y

      this.draggableImage.nativeElement.style.transform = `matrix(${matrix.join(', ')})`;
    }
  }

  stopDragging() {
    if (!this.isDragging) return;
    this.isDragging = false;

    // Remove event listeners
    document.removeEventListener('mousemove', this.dragImage.bind(this));
    document.removeEventListener('mouseup', this.stopDragging.bind(this));
  }
}
