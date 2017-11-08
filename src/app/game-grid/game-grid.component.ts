import { Component, OnInit, OnDestroy, HostListener, Renderer2, AfterViewInit, ViewChildren, QueryList } from '@angular/core';
import { Tile } from './tile.model';
import { TicTacToeService } from '../tic-tac-toe.service';
import { Subscription } from 'rxjs/Subscription';
import { MatGridTile, MatTooltip } from '@angular/material';

@Component({
  selector: 'app-game-grid',
  templateUrl: './game-grid.component.html',
  styleUrls: ['./game-grid.component.css']
})
export class GameGridComponent implements OnInit, AfterViewInit, OnDestroy {
  focusedTileId: number;
  columns: number;
  tiles: Tile[];
  emptyTileIds: number[];
  gridSubscription : Subscription;
  hintSubscription : Subscription;
  //@ViewChildren('') popups: QueryList<any>;

  constructor(private ticTacToeService: TicTacToeService, private renderer: Renderer2) { }

  ngOnInit() {
    this.tiles = [];
    this.emptyTileIds = [];
    this.columns = this.ticTacToeService.getColumnsCount();
    this.gridSubscription = this.ticTacToeService.gridChanged.subscribe(
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