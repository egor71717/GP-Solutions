export class Message{
    constructor(public text: string, public type = MessageType.Default) { }
}

export enum MessageType{
    Default,
    Error,
    Warning,
    Success
}