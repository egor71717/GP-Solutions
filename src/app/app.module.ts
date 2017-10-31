import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { GameGridComponent } from './game-grid/game-grid.component';
import { SettingsComponent } from './settings/settings.component';
import { TicTacToeService } from './tic_tac_toe.service';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    GameGridComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule
  ],
  providers: [TicTacToeService],
  bootstrap: [AppComponent]
})
export class AppModule { }
