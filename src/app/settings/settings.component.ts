import { Component, OnInit } from '@angular/core';
import { TicTacToeService } from '../services/tic-tac-toe.service';
import { LocalstorageService } from '../services/localstorage.service';
import { GameLogService } from '../services/game-log.service';
import { Message, MessageType } from '../message.model';
import { Subscription } from 'rxjs/Subscription';
import { Subscribable } from 'rxjs/Observable';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/empty';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit , OnDestroy{
  columns: number;
  maxColumns: number;
  minColumns: number;
  startedReplay: boolean;
  checkedStarter: string;
  checkedMode: string;
  checkedHints: string;
  checkedLocalstorage: string;
  storedGamesCount: number;

  gameReplayedSubscription: Subscription;
  columnsSubscription: Subscription;
  storedGamesCountSubscription: Subscription;

  constructor(private ticTacToeService : TicTacToeService, private localstorageService: LocalstorageService, private gameLogService: GameLogService) { }

  ngOnInit() {
    this.maxColumns = 4;
    this.minColumns = 3;
    this.startedReplay = false;
    this.checkedStarter = "computer";
    this.checkedMode = "dumb";
    this.checkedHints = "on";
    this.checkedLocalstorage = "on";
    this.storedGamesCountSubscription =this.localstorageService.storedGamesCountObservable.subscribe(data => this.storedGamesCount = data);
    this.columnsSubscription = this.ticTacToeService.columnsObservable.subscribe(data => this.columns = data);
    this.gameReplayedSubscription = Observable.empty().subscribe();
  }

  ngOnDestroy(): void {
    this.storedGamesCountSubscription.unsubscribe();
    this.columnsSubscription.unsubscribe();
    if(!this.gameReplayedSubscription.closed)
      this.gameReplayedSubscription.unsubscribe();
  }

  startGame(){
    console.log(this.columns);
    this.ticTacToeService.startGame(this.checkedStarter, this.columns, this.checkedMode, this.checkedHints, this.checkedLocalstorage);
  }

  reset(){
    this.ticTacToeService.resetGrid();
    this.ticTacToeService.stopReplay();
    this.startedReplay = false;
  }

  clear(){
    this.localstorageService.clear();
  }

  replaySavedGames(){
    console.log(localStorage);
    if(localStorage.length === 0){
      this.gameLogService.pushMessage(new Message("--Nothing to Replay.", MessageType.Warning));
      return;
    }
    this.localstorageService.forceFinish();
    this.startedReplay = true;
    let games = this.localstorageService.getGames();
    console.log(games);
    let i = 0;
    let delay = 1000;
    this.gameReplayedSubscription = this.ticTacToeService.gameReplayed.subscribe(
      () => {
        if(i < games.length){
          this.ticTacToeService.replayGame(games[i++], delay);
        }
        else {
          this.gameLogService.pushMessage(new Message('--Replay finished.', MessageType.Success));
          this.startedReplay = false;
        }
      },
    );
    this.ticTacToeService.replayGame(games[i++], delay);
  }

  stopReplay(){
    this.gameReplayedSubscription.unsubscribe();
    this.ticTacToeService.stopReplay();
    this.startedReplay = false;
  }

}
