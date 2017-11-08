import { Subject } from "rxjs/Subject"
import { Tile } from "./game-grid/tile.model";
import { Injectable } from "@angular/core";
import { GameLogService } from "./game-log.service";
import { Message, MessageType } from "./message.model";

@Injectable()
export class TicTacToeService{ 

    private storedGames = [];
    private gameStarted : boolean;
    private gridIsReseted: boolean;
    private hintsOn: boolean;
    private playersSign : string;
    private computerSign : string;
    private mode :string;
    private columns : number;
    private turnNumber: number;
    private tiles : Tile[];
    gridChanged: Subject<Tile[]> = new Subject();
    hintPushed: Subject<number> = new Subject();

    constructor(private gameLogService: GameLogService) {
        this.gameStarted = false;
        this.gridIsReseted = true;
        this.hintsOn = true;
        this.playersSign = 'not chosen';
        this.computerSign = 'not chosen';
        this.mode = 'not chosen';
        this.columns = 3;
        this.turnNumber = 0;
        this.tiles = [];
    }

    startGame(startsFirst : string, columns : number, mode : string, hints: string){
        this.mode = mode;
        this.columns = columns;
        this.turnNumber = 1;
        this.resetGrid();
        this.gameStarted = true;
        this.initializeGrid();
        this.hintsOn = (hints === "on");
        this.gameLogService.pushMessage(new Message("--Game started.", MessageType.Success))

        if(startsFirst === "player")
        {
            this.playersSign = "X";
            this.computerSign = "O";
            this.gameLogService.pushMessage(new Message('-Turn '+this.turnNumber+': It\'s your turn.'));
            // if(this.hintsOn)
            //     this.hintPushed.next(this.dumbHint());
        }
        if(startsFirst === "computer")
        {
            this.playersSign = "O";
            this.computerSign = "X";
            this.computerTurn();
        }
    }

    private initializeGrid(){
        this.tiles = this.getEmptyGrid();
        this.gridIsReseted = false;
        this.gridChanged.next(this.tiles);
    }

    getEmptyGrid(): Tile[] {
        let grid = []
        let tilesCount = Math.pow(this.columns, 2);
        for(let i = 0; i < tilesCount; ++i){
            grid.push(new Tile( i, 'default' ));
        }
        return grid;
        
    }

    getColumnsCount(){
        return this.columns
    }

    resetGrid(){
        if(!this.gridIsReseted){
            this.gameStarted = false;
            this.tiles = [];
            this.gameLogService.resetMessages();
            this.gameLogService.pushMessage(new Message("--Grid cleared."));
            this.gridChanged.next(this.tiles);
        }
    }

    makeTurn(clickedTileIndex: number){
        if(!this.gameStarted)
            this.gameLogService.pushMessage(new Message("--Game did not start!", MessageType.Error) );
        else{
            this.tiles[clickedTileIndex].state = this.playersSign;
            this.gridChanged.next(this.tiles);
            this.turnNumber++;
            if(this.turnNumber >= 5 && this.checkForVictory(this.playersSign)){
                this.gameStarted = false;
                this.gameLogService.pushMessage(new Message("--You won!", MessageType.Success));
            }
            else if(this.turnNumber === Math.pow(this.columns, 2) + 1)
                this.gameLogService.pushMessage(new Message('--It is draw!', MessageType.Warning));
            else
                this.computerTurn();
        }
    }

    computerTurn() {
        if(this.mode === 'dumb'){
            this.dumbAITurn();
        }
        this.gridChanged.next(this.tiles);
        this.gameLogService.pushMessage(new Message('-Turn '+this.turnNumber+': Computers turn.'));
        this.turnNumber++;
        if(this.turnNumber >= 5 && this.checkForVictory(this.computerSign)){
            this.gameStarted = false;
            this.gameLogService.pushMessage(new Message("--Computer won", MessageType.Error));
        }
        else if(this.turnNumber === Math.pow(this.columns, 2) + 1)
            this.gameLogService.pushMessage(new Message('--It is draw!', MessageType.Warning));
        else{
            this.gameLogService.pushMessage(new Message('-Turn '+this.turnNumber+': It is your turn.'));
            if(this.hintsOn){
                this.hintPushed.next(this.dumbHint());
            }      
        }
    }

    private dumbAITurn(){
        let emptyTiles = this.getEmptyTiles();
        let turnIndex = Math.floor(Math.random() * emptyTiles.length);
        emptyTiles[turnIndex].state = this.computerSign;   
    }

    private dumbHint(){
        let emptyTiles = this.getEmptyTiles();
        let turnIndex = Math.floor(Math.random() * emptyTiles.length);
        return turnIndex;
    }

    private getEmptyTiles(){
        let emptyTiles = [];
        for(let i = 0, j = 0; i < this.tiles.length; ++i )
        {
            if(this.tiles[i].state === 'default'){
                emptyTiles[j] = this.tiles[i];
                ++j;
            }
        }
        return emptyTiles;
    }

    getEmptyTileIds(){
        let emptyTileIds = [];
        for(let i = 0, j = 0; i < this.tiles.length; ++i )
        {
            if(this.tiles[i].state === 'default'){
                emptyTileIds[j] = i;
                ++j;
            }
        }
        return emptyTileIds;
    }

    private checkForVictory(checkSign : string): boolean{
        let victoryInColumns = this.checkSequenceForVictory(checkSign, this.getColumns());
        if(victoryInColumns) return true;
        let victoryInRows = this.checkSequenceForVictory(checkSign, this.getRows());
        if(victoryInRows) return true;
        let leftDiagonal = this.transformToSequence(this.getLeftDiagonal());
        let victoryInLeftDiagonal = this.checkSequenceForVictory(checkSign, leftDiagonal);
        if(victoryInLeftDiagonal) return true;
        let rightDiagonal = this.transformToSequence(this.getRightDiagonal());
        let victoryInRightDiagonal = this.checkSequenceForVictory(checkSign, rightDiagonal);
        if(victoryInRightDiagonal) return true;
        return false;
    }

    private checkSequenceForVictory(checkSign : string, sequence: Tile[][]): boolean {
        for(let i = 0; i < sequence.length; ++i){
            let hasVictorySequence = true;
            for(let j = 0; j < sequence[i].length; ++j){
                if(sequence[i][j].state !== checkSign)
                {
                    hasVictorySequence = false;
                    break;
                }   
            }
            if(hasVictorySequence)
                return true;
        }
        return false;

    }

    private getColumns(): Tile[][]{
        let columnsArray = [];
        for(let i = 0; i < this.columns; ++i)
            columnsArray.push(this.getColumn(i));
        return columnsArray;
    }

    private getColumn(index: number): Tile[]{
        if(index >= this.columns || index < 0)
            throw new Error('wrong params for getColumn()');

        let stepColumnElementsIndexes = this.columns;
        let columnTiles = [];
        for(let i = index, j=0; i < this.tiles.length; i+=stepColumnElementsIndexes){
            columnTiles[j] = this.tiles[i];
            ++j;
        }
        return columnTiles;
    }

    private getRows(): Tile[][]{
        let rowsArray = [];
        for(let i = 0; i < this.columns; ++i)
            rowsArray.push(this.getRow(i));
        return rowsArray;
    }

    private getRow(index: number): Tile[]{
        let rows = this.columns;
        if(index >= rows || index < 0)
            throw new Error('wrong params for getRow()');

        let rowTiles = [];
        let i = index * this.columns; //first element index
        while(rowTiles.length < rows){
            rowTiles.push(this.tiles[i]);
            ++i;
        }
        return rowTiles;
    }

    private getLeftDiagonal(): Tile[]{
        let leftDiagonal = [];
        for(let i = 0; i < this.tiles.length; i+=this.columns+1)
            leftDiagonal.push(this.tiles[i]);
        return leftDiagonal;
    }

    private getRightDiagonal(): Tile[]{
        let rightDiagonal = [];
        for(let i = this.columns-1; i < this.tiles.length; i+=this.columns-1)
        rightDiagonal.push(this.tiles[i]);
        return rightDiagonal;
    }

    private transformToSequence(array: Tile[]): Tile[][]{
        let sequence = [];
        sequence.push(array);
        return sequence
    }
}