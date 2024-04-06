import { Component } from '@angular/core';
import {AuthenticationService} from "../services/authentication.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [
    NgIf
  ],
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  authenticated = false;

  switchToFrench(): void {
    // Add functionality to switch the language to French here
    console.log("Switching to French");
  }

  constructor(private authService: AuthenticationService) {
  }

  ngOnInit(){
    this.authService.currentUser$.subscribe(user => {
      if(user){
        this.authenticated = true;
      }
    })

  }
}
