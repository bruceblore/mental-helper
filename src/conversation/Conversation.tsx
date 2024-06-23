import React, { useState, KeyboardEvent } from 'react';
import { ConversationCache } from '../types';
import "./Conversation.css"

type ConversationProps = {
    conversation: ConversationCache,
    setConversation: React.Dispatch<ConversationCache>
}

function Conversation(props: ConversationProps) {
    let [recording, setRecording] = useState<boolean>(false);

    function handleSubmitButton() {
        throw new Error('Function not implemented.');
    }

    function handleTextBoxKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
        if (event.key === "Enter")
            handleSubmitButton()
    }

    function handleCallButton() {
        setRecording(!recording);
    }

    return (<div className="conversation">
        <div className="message-container">
            {props.conversation.map(message => {
                if (message.sender === "user") {
                    return <div className="user-message"><span className="message-sender">User: </span>{message.body}</div>
                } else {
                    return <div className="hume-message"><span className="message-sender">Mindpal: </span>{message.body}</div>
                }
            })}
        </div>
        <div className="chat-bar">
            <input type="button" className="call-button" value="Call" onClick={handleCallButton} style={recording ? { backgroundColor: "#ff0000" } : {}}></input>
            <input type="text" className='text-box' placeholder="Enter text here" onKeyDown={handleTextBoxKeyDown}></input>
            <input type="button" className='submit-button' value="Submit" onClick={handleSubmitButton}></input>
        </div>
    </div>);
}

export default Conversation;
