import { NgModule } from "@angular/core";
import { MatRadioModule, MatGridListModule, MatButtonModule } from "@angular/material";
 
@NgModule({
    exports: [
        MatRadioModule,
        MatGridListModule,
        MatButtonModule
    ]  
})
export class MaterialModule { }