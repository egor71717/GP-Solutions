import { Component, OnInit } from '@angular/core';
import { TicTacToeService } from '../tic-tac-toe.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  checkedStarter: string;
  checkedMode: string;
  checkedHints: string;
  checkedLocalstorage: string;


  constructor(private ticTacToeService : TicTacToeService) { }


  ngOnInit() {
    this.checkedStarter = "computer";
    this.checkedMode = "dumb";
    this.checkedHints = "on";
    this.checkedLocalstorage = "on";
  }

  onStart(){
    this.ticTacToeService.startGame(this.checkedStarter, 3, this.checkedMode, this.checkedHints, this.checkedLocalstorage);
  }

  onReset(){
    this.ticTacToeService.resetGrid();
  }

}
