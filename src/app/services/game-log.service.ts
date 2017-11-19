import { TicTacToeService } from "./tic-tac-toe.service";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
import { Message } from "../message.model";
import { Subscription } from "rxjs/Subscription";

@Injectable()
export class GameLogService{
    messagesReseted: Subject<{}> = new Subject();
    messagePushed: Subject<Message> = new Subject();
    private log: Message[] = [];

    pushMessage(message: Message){
        this.log.push(message);
        this.messagePushed.next(message);
    }

    resetMessages(){
        this.log = [];
        this.messagesReseted.next();
        this.pushMessage(new Message("--log is reseted."));
    }

    
}   