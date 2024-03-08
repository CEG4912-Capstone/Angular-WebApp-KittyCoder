import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {BlockcodeComponent} from "./blockcode/blockcode.component";
import {DragDropModule} from "@angular/cdk/drag-drop";

const routes: Routes = [
  { path: 'codeblock/:id', component: BlockcodeComponent },
];

@NgModule({
  declarations: [],
  imports: [
    DragDropModule,
    CommonModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class ProjectModule { }
