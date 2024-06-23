import React, { useState, MouseEvent } from 'react';
import logo from './logo.png';
import './App.css';
import Conversation from './conversation/Conversation';
import Summary from './summary/Summary';
import { ConversationCache } from './types';

function App() {
  let [summaryDisplayed, setSummaryDisplayed] = useState<boolean>(false);
  let [conversation, setConversation] = useState<ConversationCache>([]);

  // Separate copy for the summary, so we don't re-summarize on literally every message
  let [summarizedConversation, setSummarizedConversation] = useState<ConversationCache>([]);

  function handleSummarizeButton(event: MouseEvent<HTMLInputElement>): void {
    // If the summary is not currently displyed, it will be, so update the summarized conversation
    if (!summaryDisplayed) {
      setSummarizedConversation(summarizedConversation);
    }
    setSummaryDisplayed(!summaryDisplayed);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <input type="button" value="Summarize" className="summarize-button" onClick={handleSummarizeButton}></input>
      </header>

      <div className="conversation-summary-container">
        <Conversation conversation={conversation} setConversation={setConversation}></Conversation>
        {summaryDisplayed ? <Summary conversation={summarizedConversation} ></Summary> : <></>}
      </div>
    </div>
  );
}

export default App;
