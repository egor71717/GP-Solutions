import { NgModule } from "@angular/core";
import { MatRadioModule, MatGridListModule, MatButtonModule } from "@angular/material";
import { MatTooltipModule } from '@angular/material/tooltip';
 
@NgModule({
    exports: [
        MatRadioModule,
        MatGridListModule,
        MatButtonModule,
        MatTooltipModule
    ]  
})
export class MaterialModule { }