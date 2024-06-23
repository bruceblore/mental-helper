export type Message = {
    sender: "hume" | "user",
    body: string,
    finished: boolean
}

export type ConversationCache = Array<Message>