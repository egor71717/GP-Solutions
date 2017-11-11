import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { GameLogService } from '../game-log.service';
import { Message, MessageType } from '../message.model';

@Component({
  selector: 'app-game-log',
  templateUrl: './game-log.component.html',
  styleUrls: ['./game-log.component.css']
})
export class GameLogComponent implements OnInit, OnDestroy {
  lastMessage: Message;
  isSuccess: boolean;
  isError: boolean;
  isWarning: boolean;
  isDefault : boolean;
  @ViewChild('comment') comments: ElementRef;
  private messagePushedSubscription: Subscription;
  private messagesResetedSubscription: Subscription;

  constructor(private gameLogService: GameLogService) { }

  ngOnInit() {
    this.lastMessage = new Message('--Start a game')
    this.isSuccess = false;
    this.isError = false;
    this.isWarning = false;
    this.isDefault = true;
    this.messagePushedSubscription = this.gameLogService.messagePushed.subscribe(
      (message : Message) => { 
        this.lastMessage = message;
        this.comments.nativeElement.value += message.text + '\n';
        this.setMessageType(message.type);
      }
    );
    this.messagesResetedSubscription = this.gameLogService.messagesReseted.subscribe(
      () => { this.comments.nativeElement.value = ""; }
    );
  }
  ngOnDestroy() {
    this.messagePushedSubscription.unsubscribe();
    this.messagesResetedSubscription.unsubscribe();
  }
  setMessageType(messageType: MessageType){
    this.isDefault = this.lastMessage.type === MessageType.Default;
    this.isError = this.lastMessage.type === MessageType.Error;
    this.isSuccess = this.lastMessage.type === MessageType.Success;
    this.isWarning = this.lastMessage.type === MessageType.Warning;
  }
}