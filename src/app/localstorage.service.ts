import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";
import { Game } from "./game.model";
import { GameGridComponent } from "./game-grid/game-grid.component";
import { Move } from "./move.model";

export class LocalstorageService{
    private firstGameId: number;
    private lastGameId: number;
    private storedGamesCount: number;
    private thisGameId: number;
    private thisTurnNumber: number;
    private isSaving: boolean;

    constructor(){
        if(localStorage.length !== 0){

            this.firstGameId = this.getFirstGameId();
            this.lastGameId = this.getLastGameId();
            this.storedGamesCount = this.lastGameId - this.firstGameId + 1;
            this.thisGameId = this.lastGameId + 1;
        }
        else{
            this.storedGamesCount = 0;
            this.thisGameId = 0;
        }
        this.thisTurnNumber = 0;
        this.isSaving = false;
    }

    private getFirstGameId(){
        if (localStorage.length === 0){
            return null;
        }
        let minId = 0;
        for(let i = 0; i < localStorage.length; i++){
            let key = localStorage.key(i);
            let id = parseInt(key.split("_")[0]);
            if(id < minId){
                minId = id;
            }
        }
        return minId;
    }

    private getLastGameId(){
        if (localStorage.length === 0){
            return null;
        }
        let maxId = 0;
        for(let i = 0; i < localStorage.length; i++){
            let key = localStorage.key(i);
            let id = parseInt(key.split("_")[0]);
            if(id > maxId){
                maxId = id;
            }
        }
        return maxId;
    }

    public uploadMooveToStorage(activatedTileId: number, isPlayer: boolean){
        this.isSaving = true;
        let key = this.thisGameId + "_" + this.thisTurnNumber;
        let data = isPlayer ? 'player':'computer';
        data += '_' + activatedTileId;
        localStorage.setItem(key, data);
        this.thisTurnNumber++;
    }

    public getGames(): Game[]{
        let games = [];
        for(let i = this.firstGameId; i <= this.lastGameId; ++i){
            games.push(this.getGame(i));
        }
        return games;
    }

    private getGame(gameId: number): Game{
        let game = new Game(gameId, []);
        let i = 0;
        let mooveString; 
        while(mooveString = localStorage.getItem(gameId+'_'+i)){
            let actor = mooveString.split('_')[0];
            let activatedIndex = parseInt(mooveString.split('_')[1]);
            game.moves.push(new Move(i, actor, activatedIndex));
            ++i;
        }
        return game;
    }

    public finishSaving(){
        this.isSaving = false;
        this.thisGameId++;
        this.thisTurnNumber = 0;
        this.storedGamesCount++;
    }

    //removes unfinished games 
    public forceFinish(){
        if(this.isSaving){
            this.undoLastUploads();
            this.isSaving = false;
            this.thisTurnNumber = 0;
        }
    }

    private undoLastUploads(){
        if(!this.isSaving)
            return;
        let index = 0;
        let key = this.thisGameId+'_'+index;
        let lastMooveIndex = localStorage.key(localStorage.length - 1).split("_").map(Number)[1];
        while(key !== this.thisGameId+'_'+(lastMooveIndex+1)){
            localStorage.removeItem(key);
        }
    }

    public clear(){
        localStorage.clear();
    }
}