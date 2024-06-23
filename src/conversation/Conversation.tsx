import React, { KeyboardEvent, useState } from 'react';
import { ConversationCache } from '../types';
import "./Conversation.css"

type ConversationProps = {
    conversation: ConversationCache,
    recording: boolean,
    setRecording: React.Dispatch<boolean>,
    enableOrDisableRecorder: (state: boolean) => void,
    sendMessage: (message: string) => void
}

function Conversation(props: ConversationProps) {
    let [messageBody, setMessageBody] = useState<string>('');

    function handleSubmitButton() {
        props.sendMessage(messageBody);
    }

    function handleTextBoxKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
        if (event.key === "Enter")
            handleSubmitButton()
    }

    function handleCallButton() {
        // The new, desired state will be the opposite of the current state
        props.enableOrDisableRecorder(!props.recording);

        props.setRecording(!props.recording);
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
            <input
                type="button"
                className="call-button"
                value="Call"
                onClick={handleCallButton}
                style={props.recording ? { backgroundColor: "#ff0000" } : {}}
            ></input>
            <input
                type="text"
                className='text-box'
                placeholder="Enter text here"
                onKeyDown={handleTextBoxKeyDown}
                value={messageBody}
                onChange={event => setMessageBody(event.target.value)}
            ></input>
            <input
                type="button"
                className='submit-button'
                value="Submit"
                onClick={handleSubmitButton}
            ></input>
        </div>
    </div>);
}

export default Conversation;
