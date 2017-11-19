import { Subject } from "rxjs/Subject"
import { Injectable } from "@angular/core";
import { GameLogService } from "./game-log.service";
import { Message, MessageType } from "../message.model";
import { LocalstorageService } from "./localstorage.service";
import { Game } from "../game.model";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import 'rxjs/add/operator/delay';
import { Move } from "../move.model";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Tile } from "../game-grid/tile.model";

@Injectable()
export class TicTacToeService{ 

    private isSavingToLocastorage: boolean;
    private storedGames = [];
    private gameStarted : boolean;
    private replayStarted: boolean;
    private gridIsReseted: boolean;
    private hintsOn: boolean;
    private playersSign : string;
    private computerSign : string;
    private mode :string;
    private turnNumber: number;
    private _columns : BehaviorSubject<number>;
    columnsObservable: Observable<number>;
    private _grid: BehaviorSubject<Tile[]>;
    gridObservable: Observable<Tile[]>;
    private _hint: Subject<number> = new Subject();
    hintObservable: Observable<number> = this._hint.asObservable();
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
        this.turnNumber = 0;
        this._columns = new BehaviorSubject(3);
        this.columnsObservable = this._columns.asObservable();
        this._grid = new BehaviorSubject([]);
        this.gridObservable = this._grid.asObservable();
    }  

    startGame(startsFirst : string, columns : number, mode : string, hints: string, localstorage: string){
        this.mode = mode;
        this._columns.next(columns);
        this.turnNumber = 1;
        this.resetGrid();
        this.gameStarted = true;
        this.initializeGrid();
        this.hintsOn = (hints === "on");
        this.isSavingToLocastorage = (localstorage === 'on');
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
        this.gridIsReseted = false;
        this._grid.next(this.getEmptyGrid());
    }

    public getEmptyGrid(): Tile[] {
        let grid = []
        let tilesCount = Math.pow(this._columns.getValue(), 2);
        for(let i = 0; i < tilesCount; ++i){
            grid.push(new Tile( i, 'default' ));
        }
        return grid;
    }

    public resetGrid(){
        this.stopReplay();
        if(!this.gridIsReseted){
            this.gameStarted = false;
            this.gameLogService.resetMessages();
            this.gameLogService.pushMessage(new Message("--Grid cleared."));
            this._grid.next([]);
        }
    }

    public makeTurn(clickedTileIndex: number){
        if(!this.gameStarted){
            this.gameLogService.pushMessage(new Message("--Game did not start!", MessageType.Error) );
        } 
        else{
            let grid = this._grid.getValue();
            grid[clickedTileIndex].state = this.playersSign;
            this._grid.next(grid);
            this.turnNumber++;
            let isPlayersMove = true;
            let isGameFinished = this.gameIsFinished(isPlayersMove);
            this.saveToStorage(clickedTileIndex, isPlayersMove, isGameFinished);

            if(!isGameFinished){
                this.computerTurn();
            }   
            else {
                this.gameStarted = false;
            }    
        }
    }

    saveToStorage(moveIndex: number, isPlayersMove: boolean, isGameFinished: boolean){
        if(this.isSavingToLocastorage){
            this.localstorageService.uploadMooveToStorage(moveIndex, isPlayersMove, this._columns.getValue());
            if(isGameFinished){
                this.localstorageService.finishSaving();
            }
        }
    }

    public replayGame(game: Game, delay: number){
        (console.log('replaying game'+ game.Id))
        this.resetGrid();
        this._columns.next(game.columns);
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
                console.log('delayed observable completed');
                this.replayStarted = false;
                this.gameReplayed.next({});
                this.gameReplayed.complete();
                this.gameReplayed = new Subject();
            }
        );
        this.replayStarted = true;
    }

    public replayMove(move: Move){
        let grid = this._grid.getValue();
        this.turnNumber = move.number;
        this.gameLogService.pushMessage(new Message('-turn '+move.number+'; index '+move.activatedIndex+move.actor ));
        grid[move.activatedIndex].state = move.actor === 'player' ? this.playersSign : this.computerSign;
        this._grid.next(grid);
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
        this.gameLogService.pushMessage(new Message('-Turn '+this.turnNumber+': Computers turn.'));
        let moveIndex;
        if(this.mode === 'dumb'){
            moveIndex = this.dumbAITurn();
        }
        let grid = this._grid.getValue();
        grid[moveIndex].state = this.computerSign;
        this._grid.next(grid);
        this.turnNumber++;
        let isPlayersMove = false;
        let isGameFinished = this.gameIsFinished(isPlayersMove);
        this.saveToStorage(moveIndex, isPlayersMove, isGameFinished);

        
        if(!isGameFinished){
            this.gameLogService.pushMessage(new Message('-Turn '+this.turnNumber+': It is your turn.'));
            // if(this.hintsOn){
            //     this.hintPushed.next(this.dumbHint());
            // }   
        }
        else if(this.isSavingToLocastorage){
            this.gameStarted = false;
        }
    }

    private gameIsFinished(isPlayer: boolean): boolean{
        let sign = isPlayer ? this.playersSign : this.computerSign
        if(this.turnNumber >= 5 && this.checkForVictory(sign)){

            if(isPlayer)
                this.gameLogService.pushMessage(new Message("--Player won!", MessageType.Success));
            else
                this.gameLogService.pushMessage(new Message("--Computer won", MessageType.Error));

            return true;
        }
        else if(this.turnNumber === Math.pow(this._columns.getValue(), 2) + 1){
            this.gameLogService.pushMessage(new Message('--It is draw!', MessageType.Warning));
            return true;
        }
        return false;
    }

    private dumbAITurn(): number{
        let emptyTiles = this.getEmptyTiles();

        if(emptyTiles.length === 0)
            return null;

        let turnIndex = Math.floor(Math.random() * emptyTiles.length);
        return emptyTiles[turnIndex].index;
    }

    private getEmptyTiles(): Tile[]{
        let emptyTiles = [];
        let grid = this._grid.getValue();

        for(let i = 0; i < grid.length; ++i)
            if(grid[i].state === 'default')
                emptyTiles.push(grid[i]);

        return emptyTiles;
    }

    public getEmptyTileIds(){
        let emptyTileIds = [];
        let grid = this._grid.getValue();

        for(let i = 0; i < grid.length; ++i )
            if(grid[i].state === 'default')
                emptyTileIds.push(i);

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
        for(let i = 0; i < this._columns.getValue(); ++i)
            columnsArray.push(this.getColumn(i));
        return columnsArray;
    }

    private getColumn(index: number): Tile[]{
        if(index >= this._columns.getValue() || index < 0)
            throw new Error('wrong params for getColumn()');

        let grid = this._grid.getValue();
        let step = this._columns.getValue();
        let columnTiles = [];

        for(let i = index; i < grid.length; i += step)
            columnTiles.push(grid[i]);

        return columnTiles;
    }

    private getRows(): Tile[][]{
        let rowsArray = [];
        for(let i = 0; i < this._columns.getValue(); ++i)
            rowsArray.push(this.getRow(i));
        return rowsArray;
    }

    private getRow(index: number): Tile[]{
        let rows = this._columns.getValue();
        if(index >= rows || index < 0)
            throw new Error('wrong params for getRow()');

        let grid = this._grid.getValue();
        let rowTiles = [];
        let first = index * rows; //first element index

        for(let i = first; rowTiles.length < rows; ++i)
            rowTiles.push(grid[i]);

        return rowTiles;
    }

    private getLeftDiagonal(): Tile[]{
        let leftDiagonal = [];
        let grid = this._grid.getValue();
        let step = this._columns.getValue() + 1;

        for(let i = 0; i < grid.length; i += step)
            leftDiagonal.push(grid[i]);

        return leftDiagonal;
    }

    private getRightDiagonal(): Tile[]{
        let rightDiagonal = [];
        let grid = this._grid.getValue();
        let step = this._columns.getValue() - 1;

        for(let i = step; i < grid.length; i += step)
            rightDiagonal.push(grid[i]);

        return rightDiagonal;
    }

    private transformToSequence(array: Tile[]): Tile[][]{
        let sequence = [];
        sequence.push(array);
        return sequence
    }
}