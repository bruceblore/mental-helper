import React, { useState, MouseEvent, useEffect } from 'react';
import logo from './logo.png';
import './App.css';
import Conversation from './conversation/Conversation';
import Summary from './summary/Summary';
import { ConversationCache, Message } from './types';
import { HumeClient, ensureSingleValidAudioTrack, getAudioStream, getBrowserSupportedMimeType, MimeType, convertBlobToBase64, Hume, convertBase64ToBlob } from 'hume';
import { StreamSocket } from 'hume/api/resources/empathicVoice';


const hume = new HumeClient({
  apiKey: '73yzXGXSnSvxnZtCT45i6n4TA5P9kHXsZVdKY3Iabn2Ivtiw',
  secretKey: 'GianNggerv8HjIFrvpAdJepaqZeLNhaaLrAxGodak0pyuEGkGQhA7wNUm00udEDg'
});
let recorder: MediaRecorder | null;
let audioStream: MediaStream | null;
const mimeType: MimeType = (() => {
  const result = getBrowserSupportedMimeType();
  return result.success ? result.mimeType : MimeType.WEBM;
})();

const audioQueue: Blob[] = [];
let isPlaying = false;
let currentAudio: HTMLAudioElement | null;

function playAudio(): void {
  if (!audioQueue.length || isPlaying) return;
  isPlaying = true;
  const audioBlob = audioQueue.shift();
  if (!audioBlob) return;
  const audioUrl = URL.createObjectURL(audioBlob);
  currentAudio = new Audio(audioUrl);
  currentAudio.play().catch()
  currentAudio.onended = () => {
    isPlaying = false;
    if (audioQueue.length) playAudio();
  }
}

function stopAudio(): void {
  currentAudio?.pause();
  currentAudio = null;
  isPlaying = false;
  audioQueue.length = 0;
}

let socket: StreamSocket | undefined;

function App() {
  let [summaryDisplayed, setSummaryDisplayed] = useState<boolean>(false);
  let [conversation, setConversation] = useState<ConversationCache>([]);
  let [conversationDisplayed, setConversationDisplayed] = useState<boolean>(false);
  // let [socket, setSocket] = useState<StreamSocket | undefined>(undefined);
  let [recording, setRecording] = useState<boolean>(false);

  function handleWebsocketMessageEvent(message: Hume.empathicVoice.SubscribeEvent): void {
    let lastMessage: Message
    switch (message.type) {
      // The model wants to output audio
      case "audio_output":
        const audioOutput = message.data;
        const blob = convertBase64ToBlob(audioOutput, mimeType);
        audioQueue.push(blob);
        if (audioQueue.length === 1) playAudio();
        break;

      // The user interrupted the model's speech
      case "user_interruption":
        stopAudio();
        break;

      // The user said something
      case "user_message":
        setConversation(oldConvo => oldConvo.concat([{
          sender: "user",
          body: message.message.content ?? "",
          finished: true
        }]))
        break;

      // The model said something
      case "assistant_message":
        setConversation(oldConvo => {
          lastMessage = oldConvo[oldConvo.length - 1];
          if (lastMessage && lastMessage.sender === "hume" && !lastMessage.finished) {
            return oldConvo.slice(0, -1).concat([{
              sender: "hume",
              body: lastMessage.body.trimEnd() + ' ' + (message.message.content ?? "").trimStart(),
              finished: false
            }])
          } else {
            return oldConvo.concat([{
              sender: "hume",
              body: message.message.content ?? "",
              finished: false
            }])
          }
        })
        break;

      // The model's message is over
      case "assistant_end":
        setConversation(oldConvo => {
          let lastMessage = oldConvo[oldConvo.length - 1];
          return oldConvo.slice(0, -1).concat([{
            sender: lastMessage.sender,
            body: lastMessage.body,
            finished: true
          }])
        })
        break;
    }
  }

  useEffect(() => {
    async function setupAudio() {
      audioStream = await getAudioStream();
      ensureSingleValidAudioTrack(audioStream);
      recorder = new MediaRecorder(audioStream, { mimeType });
      recorder.ondataavailable = async ({ data }) => {
        console.log('data available');
        if (data.size < 1) return;
        const encodedAudioData = await convertBlobToBase64(data);
        const audioInput: Omit<Hume.empathicVoice.AudioInput, 'type'> = { data: encodedAudioData }
        socket?.sendAudioInput(audioInput);
      }
    }

    async function setupHume() {
      // Blatantly copied from the hume tutorial
      // https://dev.hume.ai/docs/empathic-voice-interface-evi/quickstart/typescript

      socket = await hume.empathicVoice.chat.connect({
        onOpen: async () => {
          await setupAudio();
          setConversationDisplayed(true);
        },
        onMessage: message => {
          handleWebsocketMessageEvent(message);
        },
        onError: error => {
          console.log(error);
        },
        onClose: () => { }
      });
    }

    setupHume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Separate copy for the summary, so we don't re-summarize on literally every message
  let [summarizedConversation, setSummarizedConversation] = useState<ConversationCache>([]);

  function handleSummarizeButton(event: MouseEvent<HTMLInputElement>): void {
    // If the summary is not currently displyed, it will be, so update the summarized conversation
    if (!summaryDisplayed) {
      setSummarizedConversation(conversation);
    }
    setSummaryDisplayed(!summaryDisplayed);
  }

  function enableOrDisableRecorder(state: boolean) {
    if (state) {
      recorder?.start(100);
    } else {
      recorder?.stop();
    }
  }

  function sendMessage(message: string) {
    socket?.sendTextInput(message);
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <input type="button" value="Summarize" className="summarize-button" onClick={handleSummarizeButton}></input>
      </header>

      <div className="conversation-summary-container">
        {conversationDisplayed ? <Conversation
          conversation={conversation}
          recording={recording}
          setRecording={setRecording}
          enableOrDisableRecorder={enableOrDisableRecorder}
          sendMessage={sendMessage}
        ></Conversation> : <></>}
        {summaryDisplayed ? <Summary conversation={summarizedConversation} ></Summary> : <></>}
      </div>
    </div>
  );
}

export default App;
