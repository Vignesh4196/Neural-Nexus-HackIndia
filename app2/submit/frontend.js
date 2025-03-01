// frontend/src/components/ChatInterface/ChatMain.js
import React, { useState, useEffect, useRef } from 'react';
import { useSpeechRecognition } from 'react-speech-kit';
import FileUpload from '../FileUpload';
import ApiService from '../../services/api';
import VoiceInput from '../VoiceInput';

const ChatInterface = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [context, setContext] = useState({});
  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => setInput(result)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await ApiService.sendToAssistant({
        input,
        context,
        mode: 'text'
      });
      
      setMessages(prev => [
        ...prev,
        { type: 'user', content: input, timestamp: new Date() },
        { type: 'assistant', ...response, timestamp: new Date() }
      ]);
      
      setContext(response.context);
      setInput('');
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await ApiService.processImage(formData);
    setMessages(prev => [
      ...prev,
      { type: 'user', content: file, isImage: true },
      { type: 'assistant', ...response }
    ]);
  };

  return (
    <div className="chat-container">
      <div className="message-list">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.isImage ? (
              <img src={URL.createObjectURL(msg.content)} alt="Uploaded" />
            ) : (
              msg.content
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="input-container">
        <VoiceInput listening={listening} startListening={listen} stopListening={stop} />
        
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak your request..."
        />

        <FileUpload onUpload={handleFileUpload} />
        
        <button type="submit">Send</button>
      </form>
    </div>
  );
};