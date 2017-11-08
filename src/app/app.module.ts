import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { GameGridComponent } from './game-grid/game-grid.component';
import { SettingsComponent } from './settings/settings.component';
import { TicTacToeService } from './tic-tac-toe.service';
import { FormsModule } from '@angular/forms';
import { GameLogService } from './game-log.service';
import { GameLogComponent } from './game-log/game-log.component';


@NgModule({
  declarations: [
    AppComponent,
    GameGridComponent,
    GameLogComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MaterialModule,
    FormsModule
  ],
  providers: [TicTacToeService, GameLogService],
  bootstrap: [AppComponent]
})
export class AppModule { }

