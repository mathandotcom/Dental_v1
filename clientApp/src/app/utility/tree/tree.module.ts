import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeComponent } from './tree.component';
import { CdkTreeModule } from '@angular/cdk/tree';
import { MatIconModule } from "@angular/material/icon";
import { MatTreeModule } from "@angular/material/tree";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";


@NgModule({
  imports: [
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  declarations: [TreeComponent],
  exports: [TreeComponent]
})
export class TreeModule {
  static forRoot() {
    return {
      ngModule: TreeModule
    }
  }
}