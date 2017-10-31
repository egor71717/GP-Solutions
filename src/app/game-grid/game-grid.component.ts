import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Tile } from './tile.model';
import { TicTacToeService } from '../tic_tac_toe.service';
import { Subscription } from 'rxjs/Subscription';
import { EventEmitter } from 'events';

@Component({
  selector: 'app-game-grid',
  templateUrl: './game-grid.component.html',
  styleUrls: ['./game-grid.component.css']
})
export class GameGridComponent implements OnInit, OnDestroy {
  columns: number;
  tiles: Tile[];
  currentStatus: string;
  gridSubscription : Subscription;
  statusSubscription : Subscription;
  @ViewChild('comment') comments: ElementRef;

  constructor(private ticTacToeService: TicTacToeService) { }

  ngOnInit() {
    this.tiles = [];
    this.columns = this.ticTacToeService.getColumnsCount();
    this.ticTacToeService.statusChanged.subscribe(
      (newStatus : string) => { 
        this.currentStatus = newStatus;
        this.comments.nativeElement.value += newStatus + '\n' }
    );
    this.ticTacToeService.gridChanged.subscribe(
      (updatedGrid: Tile[]) => { this.tiles = updatedGrid }
    );
  }

  ngOnDestroy() {
    this.statusSubscription.unsubscribe();
    this.gridSubscription.unsubscribe();
  }

  onTileClick(clickedTileIndex: number){
    this.ticTacToeService.makeTurn(clickedTileIndex)
  }
}