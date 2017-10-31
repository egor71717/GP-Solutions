import { Component, OnInit } from '@angular/core';
import { TicTacToeService } from '../tic_tac_toe.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  checkedStarter: string;
  checkedMode: string;
  gameStarted: boolean;

  constructor(private ticTacToeService : TicTacToeService) { }


  ngOnInit() {
    this.checkedStarter = "computer";
    this.checkedMode = "dumb";
  }

  onStart(){
    this.ticTacToeService.startGame(this.checkedStarter, 3, this.checkedMode);
  }

  onReset(){
    this.ticTacToeService.resetGrid();
  }

}
