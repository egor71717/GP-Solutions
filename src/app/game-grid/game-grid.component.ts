import { Component, OnInit, OnDestroy, HostListener, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Tile } from './tile.model';
import { Subscription } from 'rxjs/Subscription';
import { MatGridTile, MatTooltip } from '@angular/material';
import { Game } from '../game.model';
import { TicTacToeService } from '../services/tic-tac-toe.service';
import { GameLogService } from '../services/game-log.service';
import { LocalstorageService } from '../services/localstorage.service';
import { Message, MessageType } from '../message.model';

@Component({
  selector: 'app-game-grid',
  templateUrl: './game-grid.component.html',
  styleUrls: ['./game-grid.component.css']
})
export class GameGridComponent implements OnInit, AfterViewInit, OnDestroy {
  startedReplay: boolean;
  focusedTileId: number;
  columns: number;
  tiles: Tile[];
  emptyTileIds: number[];
  gridSubscription : Subscription;
  hintSubscription : Subscription;
  columnsSubscription: Subscription;
  
  //@ViewChildren('') popups: QueryList<any>;

  constructor(private ticTacToeService: TicTacToeService, private localstorageService : LocalstorageService, private gameLogService: GameLogService) { }

  ngOnInit() {
    this.tiles = [];
    this.emptyTileIds = [];
    this.columnsSubscription = this.ticTacToeService.columnsObservable.subscribe(data => this.columns = data);
    this.gridSubscription = this.ticTacToeService.gridObservable.subscribe(
      (updatedGrid: Tile[]) => { 
        if(updatedGrid.length === 0)
          this.focusedTileId = null;
        this.tiles = updatedGrid
        this.emptyTileIds = this.ticTacToeService.getEmptyTileIds();
      }
    );
  }

  ngAfterViewInit(): void {
    this.showHint(1);
    //this.hintSubscription = this.ticTacToeService.hintPushed.subscribe(this.showHint);
  }

  ngOnDestroy() {
    this.gridSubscription.unsubscribe();
    this.hintSubscription.unsubscribe();
    this.columnsSubscription.unsubscribe();
    this.localstorageService.forceFinish();
  }

  onTileClick(clickedTileIndex: number){
    this.ticTacToeService.makeTurn(clickedTileIndex)
  }

  showHint(tileId: number){
    //console.log(this.popups)
  }

  focusTile(TileId: number){
    this.focusedTileId = TileId;
    let id = "tile" + this.focusedTileId;
    let focusedTileElement = document.getElementById(id);
    focusedTileElement.focus();
  }

  focusPreviousTile(){
    if(this.emptyTileIds.length === 1)
      return;
    if(!this.focusedTileId){
      this.focusTile(this.emptyTileIds[this.emptyTileIds.length - 1]);
      return;
    }  
    let index = this.emptyTileIds.indexOf(this.focusedTileId);
    if(index - 1 < 0)
      this.focusTile(this.emptyTileIds[this.emptyTileIds.length - 1]);
    else
      this.focusTile(this.emptyTileIds[index - 1])
  }

  focusNextTile(){
    if(this.emptyTileIds.length === 1)
      return;
    let index = this.emptyTileIds.indexOf(this.focusedTileId);
    if(index + 1 === this.emptyTileIds.length)
      this.focusTile(this.emptyTileIds[0]);
    else
      this.focusTile(this.emptyTileIds[index + 1])
  }

  //does not nork in Edge
  @HostListener('document:keydown', ['$event']) keydown(event: KeyboardEvent){
    if(this.tiles.length === 0)
      return true;
    let key = event.key;
    if(key === "ArrowLeft"){
      this.focusPreviousTile();
    }  
    if(key === "ArrowRight"){
      this.focusNextTile();
    }
    if(key === "Enter"){
      this.ticTacToeService.makeTurn(this.focusedTileId);
    }
  }
}