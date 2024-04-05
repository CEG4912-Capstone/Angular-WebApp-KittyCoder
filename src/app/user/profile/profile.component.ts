import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatMenuModule } from "@angular/material/menu";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { RouterLink } from "@angular/router";
import { MatTabGroup, MatTab } from "@angular/material/tabs";
import { MatCardModule } from '@angular/material/card';
import {MatFormField, MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service'; // Adjust the path as necessary
import { IUser } from '../../models/user.model';
import {Subscription} from "rxjs";
import { NotLoggedInDialogComponent } from './not-logged-in-dialog.component';
import {NgIf} from "@angular/common";
import {MatDialog, MatDialogActions, MatDialogClose, MatDialogContent} from "@angular/material/dialog"; // Adjust the path as necessary

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatToolbarModule, MatMenuModule, MatIconModule, MatButtonModule, RouterLink, MatCardModule, FormsModule, MatFormField, MatInputModule, MatTabGroup, MatTab, NgIf, MatDialogContent, MatDialogActions, MatDialogClose],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  bio: string = '';
  currentUser: IUser | null = null;
  private subscription: Subscription = new Subscription();
  constructor(private authService: AuthenticationService,public dialog: MatDialog) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        if(user){
          this.currentUser = user;
        } else {
          this.openNotLoggedInDialog();
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  openNotLoggedInDialog(): void {
    document.getElementById('pf')?.classList.add('blur-background');

    const dialogRef = this.dialog.open(NotLoggedInDialogComponent, {
      disableClose: true,
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      document.getElementById('pf')?.classList.remove('blur-background');
      // Handle any actions after the dialog is closed
    });
  }

}
