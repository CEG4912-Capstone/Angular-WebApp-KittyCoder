// not-logged-in-dialog.component.ts
import { Component } from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-not-logged-in-dialog',
  standalone: true, // Mark the component as standalone
  imports: [
    // Import other Angular Material components or directives used in this component
    MatDialogActions,
    MatDialogContent,
    MatButton,
    MatDialogClose,
    RouterLink,
  ],
  templateUrl: './not-logged-in-dialog.component.html',
  styleUrl: `not-logged-in-dialog.component.css`,

})
export class NotLoggedInDialogComponent {
  constructor() {}
}
