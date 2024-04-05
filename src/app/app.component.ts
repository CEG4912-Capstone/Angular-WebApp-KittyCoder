import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatDrawer, MatDrawerContainer} from "@angular/material/sidenav";
import {MatButton} from "@angular/material/button";
import {NgIf, NgOptimizedImage} from "@angular/common";
import {MatExpansionPanelTitle} from "@angular/material/expansion";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatCard, MatCardAvatar, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {MatListItem, MatNavList} from "@angular/material/list";
import {IUser} from "./models/user.model";
import {Subscription} from "rxjs";
import {AuthenticationService} from "./services/authentication.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DragDropModule, RouterOutlet, MatDrawerContainer, MatDrawer, MatButton, NgIf, RouterLinkActive, RouterLink, MatExpansionPanelTitle, MatToolbar, MatIcon, NgOptimizedImage, MatCardAvatar, MatCardHeader, MatCardTitle, MatCard, MatNavList, MatListItem],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'KittyCoder';
  showFiller = false;

  authenticated = false;
  private subscription: Subscription = new Subscription();
  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        if(user){
          this.authenticated = true;
        }
      })
    );
  }
}
