import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";
import { Game } from "./game.model";
import { GameGridComponent } from "./game-grid/game-grid.component";
import { Move } from "./move.model";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/do';
import { isNull } from "util";

export class LocalstorageService{
    // private firstGameId: number;
    // private lastGameId: number;
    // private storedGamesCount: number;
    private thisGameId: number;
    private thisTurnNumber: number;
    private isSaving: boolean;
 
    private _thisTurnNumber : BehaviorSubject<number>; 
    private _firstGameId: BehaviorSubject<number>; 
    private _lastGameId: BehaviorSubject<number>; 
    public storedGamesCountObservable: Observable<number>; 

    constructor(){
        this._firstGameId = new BehaviorSubject(this.getFirstGameId());
        this._lastGameId = new BehaviorSubject(this.getLastGameId());
        this.storedGamesCountObservable = Observable.combineLatest(this._firstGameId.asObservable(), this._lastGameId.asObservable(),
        (firstGameId: number,lastGameId:number) => { 
            // console.log('firstgameId: '+firstGameId+'\nlastgameId: '+lastGameId)
            if(isNull(firstGameId) || isNull(lastGameId))
                return 0;
            else
                return lastGameId - firstGameId + 1
        });
        this._lastGameId.subscribe(data => this.thisGameId = isNull(data) ? 0 : data + 1);
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
        for(let i = this._firstGameId.getValue(); i <= this._lastGameId.getValue(); ++i){
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
        this._firstGameId.next(this.getFirstGameId())
        this._lastGameId.next(this.getLastGameId());
    }

    //removes unfinished games 
    public forceFinish(){
        this.undoLastUploads();
        this.isSaving = false;
        this.thisTurnNumber = 0;
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
        this._firstGameId.next(this.getFirstGameId());
        this._lastGameId.next(this.getLastGameId());
    }
}