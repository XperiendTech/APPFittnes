
import React from 'react';
import Navbar from './Navbar';
import AIAssistantButton from '../ai/AIAssistantButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <main className="flex-grow pb-20">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      <Navbar />
      <AIAssistantButton />
    </div>
  );
};

export default Layout;
