import { Subject } from "rxjs/Subject"
import { Tile } from "./game-grid/tile.model";


export class TicTacToeService{   
    private gameStarted : boolean;
    private gridIsReseted: boolean;
    private playersSign : string;
    private computerSign : string;
    private mode :string;
    private columns : number;
    private turnNumber: number;
    private tiles : Tile[];
    statusChanged: Subject<string> = new Subject();
    gridChanged: Subject<Tile[]> = new Subject();

    constructor() {
        this.gameStarted = false;
        this.gridIsReseted = true;
        this.playersSign = 'not chosen';
        this.computerSign = 'not chosen';
        this.mode = 'not chosen';
        this.columns = 3;
        this.turnNumber = 0;
        this.tiles = [];
        this.statusChanged.next("start a new game");
    }

    startGame(startsFirst : string, columns : number, mode : string){
        this.mode = mode;
        this.turnNumber = 1;
        this.columns = columns;
        this.resetGrid();
        this.gameStarted = true;
        this.tiles = this.getGrid();
        if(startsFirst === "player")
        {
            this.playersSign = "X";
            this.computerSign = "O";
            this.statusChanged.next('-Turn '+this.turnNumber+'. It is your turn.');
        }
        if(startsFirst === "computer")
        {
            this.playersSign = "O";
            this.computerSign = "X";
            this.computerTurn();
        }
    }

    private getGrid(): Tile[] {
        if(this.tiles.length === 0){
            let tilesCount = Math.pow(this.columns, 2);
            for(let i = 0; i < tilesCount; ++i){
                this.tiles.push(new Tile( i, 'default' ));
            }
            this.gridIsReseted = false;
            this.gridChanged.next(this.tiles);
        }
        return this.tiles;
    }

    getColumnsCount(){
        return this.columns
    }

    resetGrid(){
        if(!this.gridIsReseted){
            this.gameStarted = false;
            this.tiles = [];
            this.statusChanged.next("-Grid reseted.");
            this.gridChanged.next(this.tiles);
        }
    }

    makeTurn(clickedTileIndex: number){
        if(!this.gameStarted)
            this.statusChanged.next("-Game did not start!")
        else{
            this.tiles[clickedTileIndex].state = this.playersSign;
            this.gridChanged.next(this.tiles);
            this.turnNumber++;
            if(this.turnNumber >= 5 && this.checkForVictory(this.playersSign)){
                this.gameStarted = false;
                this.statusChanged.next("-You won!");
            }
            else if(this.turnNumber === Math.pow(this.columns, 2) + 1)
                this.statusChanged.next('-It is draw!');
            else
                this.computerTurn();
        }
    }

    computerTurn() {
        if(this.mode === 'dumb'){
            this.dumbAITurn();
        }
        this.gridChanged.next(this.tiles);
        this.statusChanged.next('-Turn '+this.turnNumber+'. Computers turn.');
        this.turnNumber++;
        if(this.turnNumber >= 5 && this.checkForVictory(this.computerSign)){
            this.gameStarted = false;
            this.statusChanged.next("-Computer won");
        }
        else if(this.turnNumber === Math.pow(this.columns, 2) + 1)
            this.statusChanged.next('-It is draw!');
        else
            this.statusChanged.next('-Turn '+this.turnNumber+'. It is your turn.');
    }

    private dumbAITurn(){
        let emptyTiles = this.getEmptyTiles();
        let turnIndex = Math.floor(Math.random() * emptyTiles.length);
        emptyTiles[turnIndex].state = this.computerSign;   
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