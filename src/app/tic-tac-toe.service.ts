import { Subject } from "rxjs/Subject"
import { Tile } from "./game-grid/tile.model";
import { Injectable } from "@angular/core";
import { GameLogService } from "./game-log.service";
import { Message, MessageType } from "./message.model";
import { LocalstorageService } from "./localstorage.service";
import { Game } from "./game.model";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import 'rxjs/add/operator/delay';
import { Move } from "./move.model";

@Injectable()
export class TicTacToeService{ 

    private saveToLocalstorage: boolean;
    private storedGames = [];
    private gameStarted : boolean;
    private replayStarted: boolean;
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
    gameReplayed: Subject<{}> = new Subject();
    replaySubscription: Subscription;
    
    constructor(private gameLogService: GameLogService, private localstorageService: LocalstorageService) {
        this.gameStarted = false;
        this.replayStarted = false;
        this.gridIsReseted = true;
        this.hintsOn = true;
        this.playersSign = 'not chosen';
        this.computerSign = 'not chosen';
        this.mode = 'not chosen';
        this.columns = 3;
        this.turnNumber = 0;
        this.tiles = [];
    }

    startGame(startsFirst : string, columns : number, mode : string, hints: string, localstorage: string){
        this.mode = mode;
        this.columns = columns;
        this.turnNumber = 1;
        this.resetGrid();
        this.gameStarted = true;
        this.initializeGrid();
        this.hintsOn = (hints === "on");
        this.saveToLocalstorage = (localstorage === 'on');
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

    public getEmptyGrid(): Tile[] {
        let grid = []
        let tilesCount = Math.pow(this.columns, 2);
        for(let i = 0; i < tilesCount; ++i){
            grid.push(new Tile( i, 'default' ));
        }
        return grid;
    }

    public getColumnsCount(){
        return this.columns
    }

    public resetGrid(){
        this.stopReplay();
        if(!this.gridIsReseted){
            this.gameStarted = false;
            this.tiles = [];
            this.gameLogService.resetMessages();
            this.gameLogService.pushMessage(new Message("--Grid cleared."));
            this.gridChanged.next(this.tiles);
        }
    }

    public makeTurn(clickedTileIndex: number){
        if(!this.gameStarted){
            this.gameLogService.pushMessage(new Message("--Game did not start!", MessageType.Error) );
        } 
        else{
            this.tiles[clickedTileIndex].state = this.playersSign;
            if(this.saveToLocalstorage){
                this.localstorageService.uploadMooveToStorage(clickedTileIndex, true);
            }
            this.gridChanged.next(this.tiles);
            this.turnNumber++;
            if(!this.gameIsFinished(true)){
                this.computerTurn();
            }   
            else if(this.saveToLocalstorage){
                this.localstorageService.finishSaving();
                this.gameStarted = false;
            }    
        }
    }

    public replayGame(game: Game, delay: number){
        this.resetGrid();
        this.initializeGrid();
        this.replayStarted = true;
        if(game.moves[0].actor === "player"){
            this.playersSign = 'X';
            this.computerSign = 'O'
        }
        else{
            this.playersSign = 'O';
            this.computerSign = 'X'
        }
        this.gameLogService.pushMessage(new Message('--Replaying game Id: #'+ game.Id));
        let delayedObservable = Observable.create(
            (observer)=>{
                let i = 0; 
                setInterval(() => {
                    if(i < game.moves.length){
                        observer.next(game.moves[i]);
                    i++;
                } 
                else{
                    setTimeout(()=>observer.complete(), delay*2)
                }
            }, delay )
        }); 
        this.replaySubscription = delayedObservable.subscribe(
            data => { this.replayMove(data) } ,
            error => { console.error(error) },
            () => { 
                this.replayStarted = false;
                this.gameReplayed.next({});
            }
        );
        this.replayStarted = true;
    }

    public replayMove(move: Move){
        this.turnNumber = move.number;
        this.gameLogService.pushMessage(new Message('-turn '+move.number+'; index '+move.activatedIndex+move.actor ));
        this.tiles[move.activatedIndex].state = move.actor === 'player' ? this.playersSign : this.computerSign;
        this.gridChanged.next(this.tiles);
        this.gameIsFinished(move.actor === "player");
    }

    public stopReplay(){
        if(this.replayStarted){
            this.replaySubscription.unsubscribe();
            this.replayStarted = false;
            this.gameLogService.pushMessage(new Message('--Replay stopped'));
        }
        else{
            this.gameLogService.pushMessage(new Message('--Replay not started', MessageType.Error))
        }
    }

    computerTurn(){
        let turnIndex;
        if(this.mode === 'dumb'){
            turnIndex = this.dumbAITurn();
        }
        if(this.saveToLocalstorage){
            this.localstorageService.uploadMooveToStorage(turnIndex, false);
        }
        this.gridChanged.next(this.tiles);
        this.gameLogService.pushMessage(new Message('-Turn '+this.turnNumber+': Computers turn.'));
        this.turnNumber++;
        if(!this.gameIsFinished(false)){
            this.gameLogService.pushMessage(new Message('-Turn '+this.turnNumber+': It is your turn.'));
            // if(this.hintsOn){
            //     this.hintPushed.next(this.dumbHint());
            // }   
        }
        else if(this.saveToLocalstorage){
            this.localstorageService.finishSaving();
            this.gameStarted = false;
        }
    }

    private gameIsFinished(isPlayer: boolean): boolean{
        let sign = isPlayer ? this.playersSign : this.computerSign
        if(this.turnNumber >= 5 && this.checkForVictory(sign)){
            if(isPlayer){
                this.gameLogService.pushMessage(new Message("--Player won!", MessageType.Success));
            }
            else{
                this.gameLogService.pushMessage(new Message("--Computer won", MessageType.Error));
            }
            return true;
        }
        else if(this.turnNumber === Math.pow(this.columns, 2) + 1){
            this.gameLogService.pushMessage(new Message('--It is draw!', MessageType.Warning));
            return true;
        }
        return false;
    }

    private dumbAITurn(): number{
        let emptyTiles = this.getEmptyTiles();
        let turnIndex = Math.floor(Math.random() * emptyTiles.length);
        emptyTiles[turnIndex].state = this.computerSign;
        return emptyTiles[turnIndex].index;   
    }

    private dumbHint(): number{
        let emptyTiles = this.getEmptyTiles();
        let turnIndex = Math.floor(Math.random() * emptyTiles.length);
        return turnIndex;
    }

    private getEmptyTiles(): Tile[]{
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

    public getEmptyTileIds(){
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