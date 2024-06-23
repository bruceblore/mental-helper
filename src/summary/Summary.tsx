import React, { useEffect, useState } from 'react';
import { ConversationCache } from '../types';
import "./Summary.css"
const { v4: uuidv4 } = require('uuid');

type SummaryProps = {
    conversation: ConversationCache
}

function Summary(props: SummaryProps) {
    let [summary, setSummary] = useState("Loading...");

    useEffect(() => {
        async function getSummary(): Promise<void> {
            let prompt = 'Another AI named Mindpal aims to improve the mental health of its users. Please summarize the following conversation it and a user. Your summary is going to be shown to the user, so take this into account when choosing tone and perspective. Try to keep it to a paragraph or two. If there are distinct recommendations, I encourage you to include a recommendation section at the end, featuring a list of the recommendations as bullet points, with newlines between them:\n' +
                props.conversation.map(message => `${message.sender === 'user' ? 'User' : 'Mindpal'}: ${message.body}\n`).reduce((prev, cur) => prev + cur, '');

            try {
                let result = await fetch("https://chat-api.you.com/smart", {
                    method: 'POST',
                    headers: {
                        'X-API-Key': 'e15c5c5e-6332-4f1c-b87e-8269d3f46045<__>1PTsFeETU8N2v5f4qmtDZVGS',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: prompt,
                        chat_id: uuidv4()
                    })
                }).then(response => response.json());
                for (let searchResult of result.search_results) {
                    console.log(searchResult);
                }
                setSummary(result.answer);
            } catch (error) {
                console.log(error);
                setSummary("Failed to summarize");
            }
        }

        getSummary();
    }, [props.conversation])

    return <div className="summary">
        <div className="summary-label">Summary</div>
        <div className="summary-content">{summary}</div>
    </div>
}

export default Summary;
