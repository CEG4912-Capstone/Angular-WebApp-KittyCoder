import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {SubscriptionLike} from 'rxjs';
import {AuthenticationService} from "../../services/authentication.service";
import {
  MatCard,
  MatCardActions,
  MatCardAvatar,
  MatCardContent,
  MatCardHeader,
  MatCardImage, MatCardModule, MatCardTitle
} from "@angular/material/card";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {RouterLink} from "@angular/router";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatFormField, MatInputModule} from "@angular/material/input";
import {NgClass, NgIf, NgStyle} from "@angular/common";
import {IUser} from "../../models/user.model";
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [MatToolbarModule, MatMenuModule, MatIconModule, MatButtonModule, MatCardAvatar, RouterLink, MatCard, MatTabGroup, MatTab, MatCardHeader, MatCardContent, MatCardActions, MatCardImage, MatCardTitle, MatCardModule, FormsModule, MatFormField, MatInputModule, ReactiveFormsModule, NgIf, NgClass, NgStyle],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  @Output()
  authenticated = new EventEmitter<IUser>(); // Emits the new steps value


  isToggleLeft = true; // Initial position

  togglePanel() {
    this.isToggleLeft = !this.isToggleLeft;
  }

  getUser: SubscriptionLike | undefined;
  invalid= false;
  hide=true;

  user1 = new FormGroup({
    loginEmail: new FormControl(null, Validators.pattern('^[^\\.\\s][\\w\\-]+(\\.[\\w\\-]+)*@([\\w-]+\\.)+[\\w-]{2,}$')),
    loginPassword: new FormControl(null, Validators.required)
  })

  @Output()
  loggedIn = new EventEmitter<any>();

  reset(){
    this.invalid = false;
  }

  logIn(user:IUser){
    //this.loggedIn.emit(user);
    this._authenticationService.setCurrentUser(user);
    this.router.navigate(['/user/profile']).then(() => {
      // Emit the authenticated event after navigation is successful
      // This assumes you still want to emit an event after setting the user,
      // which might not be necessary depending on how your application is structured
      this.authenticated.emit(user);
    });
  }

  checkUser(){
    this.getUser = this._authenticationService.get(this.user1.value.loginEmail).subscribe((res)=> {
      if(this.user1.value.loginPassword === res?.password){
        this.logIn(res);
      }else{
        this.invalid = true;
      }
    })
  }


  hide1 = true;
  hide2 = true;

  show = false;


  //form definition & input validation
  user2 = new FormGroup({
      userName: new FormControl(null,[Validators.minLength(5)]),
      email: new FormControl(null,[Validators.pattern('^[^\\.\\s][\\w\\-]+(\\.[\\w\\-]+)*@([\\w-]+\\.)+[\\w-]{2,}$'),Validators.required]),
      password: new FormControl(null,Validators.pattern('^(?=.*[a-z].*[a-z])(?=.*[!"#...\\d].*[!"#...\\d]).{8,}$')),
      confirmedPassword: new FormControl(null,Validators.required)
    },
    { validators: [this.userExists('userName'),this.userExists('email'),this.matchValidator('password', 'confirmedPassword')]}
  );

  createUser: SubscriptionLike | undefined;
  getUserName: SubscriptionLike | undefined;
  getUserEmail: SubscriptionLike | undefined;

  emailAlreadyExists = false;
  usernameAlreadyExists = false;

  constructor(private router: Router,private _authenticationService : AuthenticationService,private changeDetectorRef: ChangeDetectorRef) {}

  matchValidator(controlName: string, matchingControlName: string): ValidatorFn {
    return (abstractControl: AbstractControl) => {
      const control = abstractControl.get(controlName);
      const matchingControl = abstractControl.get(matchingControlName);

      if (matchingControl!.errors && !matchingControl!.errors?.['confirmedValidator']) {
        return null;
      }

      if (control!.value !== matchingControl!.value) {
        const error = { confirmedValidator: 'Passwords do not match.' };
        matchingControl!.setErrors(error);
        return error;
      } else {
        matchingControl!.setErrors(null);
        return null;
      }
    }
  }

  ngAfterViewInit() {
    this.changeDetectorRef.detectChanges();
  }

  userExists(controlName: string): ValidatorFn {
    return (abstractControl: AbstractControl) => {
      const control = abstractControl.get(controlName);

      if (control!.errors && !control!.errors?.['existsValidator']) {
        return null;
      }

      if(this.usernameAlreadyExists || this.emailAlreadyExists){
        const error = { existsValidator: 'User already Exists.' };
        control!.setErrors(error);
        return error;
      }else {
        control!.setErrors(null);
        return null;
      }
    }
  }

  retrieveName(){
    this.getUserName = this._authenticationService.getUser(this.user2.value.userName).subscribe((res)=>{
      this.usernameAlreadyExists = res != undefined || res != null;
    })
  }

  retrieveEmail(){
    this.getUserEmail = this._authenticationService.get(this.user2.value.email).subscribe((res)=>{
      this.emailAlreadyExists = res != undefined || res != null;
    })

  }

  onSubmit(){
    if(this.user2.valid && !this.emailAlreadyExists && !this.usernameAlreadyExists) {
      this.createUser = this._authenticationService.create(this.user2.value).subscribe(() => {
        //this.logIn(this.user2.value);
      });

      this.getUser = this._authenticationService.get(this.user2.value.email).subscribe((res)=> {
        this.logIn(res);
      });
      console.log("user logged in!")
    }
  }

  ngOnDestroy() {
    // this.getUser.unsubscribe();
    if(this.createUser){
      this.createUser.unsubscribe();
    }
    if(this.getUserEmail){
      this.getUserEmail.unsubscribe();
    }
    if(this.getUserName){
      this.getUserName.unsubscribe();
    }
  }

  ngOnInit(): void {
  }

}
