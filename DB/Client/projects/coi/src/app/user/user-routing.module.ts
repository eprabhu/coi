import { RouterModule, Routes } from "@angular/router";
import { FaqComponent } from "./faq/faq.component";
import { NgModule } from "@angular/core";

const ROUTES: Routes = [
    { path: 'faq', component: FaqComponent }
]
@NgModule({
    imports: [RouterModule.forChild(ROUTES)],
    exports: [RouterModule]
})
export class UserRoutingModule { }
