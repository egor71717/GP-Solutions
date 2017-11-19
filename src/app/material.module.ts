import { NgModule } from "@angular/core";
import { MatRadioModule, MatGridListModule, MatButtonModule, MatSliderModule } from "@angular/material";
import { MatTooltipModule } from '@angular/material/tooltip';
 
@NgModule({
    exports: [
        MatRadioModule,
        MatGridListModule,
        MatButtonModule,
        MatTooltipModule,
        MatSliderModule
    ]  
})
export class MaterialModule { }