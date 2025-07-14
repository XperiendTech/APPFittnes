
import React, { useState } from 'react';
import AIAssistantModal from './AIAssistantModal';
import { ChatBubbleIcon } from '../icons/Icons';

const AIAssistantButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-20 right-4 bg-brand-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-brand-secondary transition-transform transform hover:scale-110"
                aria-label="Abrir asistente de IA"
            >
                <ChatBubbleIcon className="w-8 h-8" />
            </button>
            <AIAssistantModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default AIAssistantButton;
