import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login.component';
import {RouterModule, Routes} from "@angular/router";
import {FormsModule} from "@angular/forms";
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button';

const route: Routes = [{path: '', component: LoginComponent}];

@NgModule({
    declarations: [
        LoginComponent
    ],
    imports: [

        CommonModule,
        RouterModule.forChild(route),
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
    ]
})
export class LoginModule {
}
