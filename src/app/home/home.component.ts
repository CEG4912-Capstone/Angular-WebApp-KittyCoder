import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  switchToFrench(): void {
    // Add functionality to switch the language to French here
    console.log("Switching to French");
  }

}
