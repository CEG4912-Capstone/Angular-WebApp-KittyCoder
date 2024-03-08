import { Component } from '@angular/core';
import { MatToolbarModule } from "@angular/material/toolbar";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatCardActions, MatCardAvatar, MatCardContent, MatCardHeader, MatCardImage} from "@angular/material/card";
import {MatCard} from "@angular/material/card";
import {MatCardTitle} from "@angular/material/card";
import {RouterLink} from "@angular/router";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatCardModule} from '@angular/material/card';
import {MatFormField, MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatToolbarModule, MatMenuModule, MatIconModule, MatButtonModule, MatCardAvatar, RouterLink, MatCard, MatTabGroup, MatTab, MatCardHeader, MatCardContent, MatCardActions, MatCardImage, MatCardTitle, MatCardModule, FormsModule, MatFormField, MatInputModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

}

