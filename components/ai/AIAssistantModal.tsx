import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { createChat } from '../../services/geminiService';
import { ChatMessage } from '../../types';
import { SendIcon, SparklesIcon } from '../icons/Icons';
import Button from '../ui/Button';
import { Chat } from '@google/genai';

interface AIAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
    const { activeUser: user } = useUser();
    const location = useLocation();
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const welcomeMessage = useMemo(() => {
        const baseMessage = `¡Hola ${user?.profile.name}! Soy tu asistente Hypertik.`;
        switch (location.pathname) {
            case '/workout':
                return `${baseMessage} ¿Necesitas ayuda con tu rutina de hoy o tienes dudas sobre la técnica de algún ejercicio?`;
            case '/nutrition':
                return `${baseMessage} ¿Analizando tu dieta? Pregúntame ideas para una cena alta en proteínas o sobre algún suplemento.`;
            case '/progress':
                return `${baseMessage} Veo que estás revisando tu progreso. ¿Quieres un análisis más detallado de tus gráficas o alguna métrica en particular?`;
            default:
                return `${baseMessage} ¿En qué puedo ayudarte hoy?`;
        }
    }, [location.pathname, user?.profile.name]);

    useEffect(() => {
        if (isOpen && user && !chatSession) {
            const session = createChat(user.profile);
            setChatSession(session);
            setMessages([{ role: 'model', content: welcomeMessage }]);
        } else if (isOpen && chatSession && messages.length === 0) {
            // If modal was closed and reopened, reset with welcome message
            setMessages([{ role: 'model', content: welcomeMessage }]);
        }
    }, [isOpen, user, chatSession, welcomeMessage, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !chatSession) return;
        
        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chatSession.sendMessage({ message: input });
            const modelMessage: ChatMessage = { role: 'model', content: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: ChatMessage = { role: 'model', content: "Lo siento, ha ocurrido un error. Inténtalo de nuevo." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-end justify-center z-50 transition-opacity duration-300" onClick={onClose}>
            <div 
                className="bg-brand-dark border-t-2 border-brand-primary w-full max-w-2xl h-[85vh] rounded-t-2xl flex flex-col p-4 shadow-2xl transform translate-y-full animate-slide-up"
                onClick={e => e.stopPropagation()}
            >
                <style>{`.animate-slide-up { animation: slide-up 0.3s forwards; } @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
                <div className="flex-shrink-0 flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-white flex items-center">
                        <SparklesIcon className="w-6 h-6 mr-2 text-brand-primary"/>
                        Asistente IA
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                 <div className="flex-grow bg-gray-800/50 rounded-xl p-4 overflow-y-auto hide-scrollbar">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-brand-primary text-white' : 'bg-gray-700 text-gray-200'}`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                 <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl bg-gray-700 text-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-brand-light rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-brand-light rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                        <div className="w-2 h-2 bg-brand-light rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                <div className="mt-4 flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Pregúntame algo..."
                        className="flex-grow bg-gray-700 border border-gray-600 rounded-l-lg p-3 text-white focus:ring-brand-primary focus:border-brand-primary focus:outline-none"
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} disabled={isLoading} className="rounded-l-none h-[50px] px-4">
                        <SendIcon className="w-6 h-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AIAssistantModal;
