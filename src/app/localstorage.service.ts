export class LocalstorageService{
    firstGameId: number;
    lastGameId: number;
    storedGamesCount: number;
    thisGameId: number;
    thisTurnNumber: number;

    constructor(){
        if(localStorage.length !== 0){
            this.firstGameId = localStorage.key(0).split("_").map(Number)[0];
            this.lastGameId = localStorage.key(localStorage.length - 1).split("_").map(Number)[0];
            this.storedGamesCount = this.lastGameId - this.firstGameId + 1;
            this.thisGameId = this.lastGameId + 1;
        }
        else{
            this.storedGamesCount = 0;
            this.thisGameId = 0;
        }
    }

    private uploadMooveToStorage(activatedTileId: number, isPlayer: boolean){
        let key = this.thisGameId + "_" + this.thisTurnNumber;
        let data = isPlayer ? 'player':'computer';
        data += '_' + activatedTileId;
        localStorage.setItem(key, data);
    }

    private downloadGames(){
        let games = [];
        for(let i = this.firstGameId; i <= this.lastGameId; ++i){
            games.push(this.getGame(i));
        }
    }

    private getGame(gameId: number){
        let mooves = []
        let i = 0;
        let moove; 
        while(moove = localStorage.getItem(gameId+'_'+i)){
            mooves[i] = moove;
        }
        return mooves;
    }

    undoLastUploads(){
        let index = 0;
        let key = this.thisGameId+'_'+index;
        let lastMooveIndex = localStorage.key(localStorage.length - 1).split("_").map(Number)[1];
        while(key !== this.thisGameId+'_'+(lastMooveIndex+1)){
            localStorage.removeItem(key);
        }
    }
}