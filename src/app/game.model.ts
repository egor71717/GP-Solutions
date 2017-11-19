import { Move } from "./move.model";

export class Game{
    constructor(public Id: number,public columns: number, public moves: Move[]){ }
}