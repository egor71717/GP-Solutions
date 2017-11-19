import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { MaterialModule } from './material.module';
import { GameGridComponent } from './game-grid/game-grid.component';
import { SettingsComponent } from './settings/settings.component';
import { FormsModule } from '@angular/forms';
import { GameLogComponent } from './game-log/game-log.component';
import { TicTacToeService } from './services/tic-tac-toe.service';
import { GameLogService } from './services/game-log.service';
import { LocalstorageService } from './services/localstorage.service';


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
  providers: [TicTacToeService, GameLogService, LocalstorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }

