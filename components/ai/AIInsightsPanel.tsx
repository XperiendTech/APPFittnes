import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { generateProactiveInsights } from '../../services/geminiService';
import { AIInsight } from '../../types';
import Card from '../ui/Card';
import { WarningIcon, InfoIcon, CheckCircleIcon, SparklesIcon } from '../icons/Icons';

const AIInsightsPanel: React.FC = () => {
    const { activeUser: user } = useUser();
    const [insights, setInsights] = useState<AIInsight[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            if (user) {
                setIsLoading(true);
                try {
                    const fetchedInsights = await generateProactiveInsights(user);
                    setInsights(fetchedInsights);
                } catch (error) {
                    console.error("Error fetching AI insights:", error);
                    setInsights([]);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        fetchInsights();
    }, [user]);

    const ICONS: { [key in AIInsight['type']]: React.FC<any> } = {
        warning: WarningIcon,
        info: InfoIcon,
        success: CheckCircleIcon,
    };
    const COLORS: { [key in AIInsight['type']]: string } = {
        warning: 'border-yellow-500/80 text-yellow-400',
        info: 'border-blue-500/80 text-blue-400',
        success: 'border-green-500/80 text-green-400',
    };

    if (isLoading) {
        return (
            <Card>
                <h2 className="text-xl font-semibold text-brand-secondary mb-4 flex items-center">
                    <SparklesIcon className="w-6 h-6 mr-2 animate-pulse" />
                    Analizando tu Progreso...
                </h2>
                <div className="space-y-3">
                    <div className="h-16 bg-gray-700/50 rounded-lg animate-pulse"></div>
                    <div className="h-16 bg-gray-700/50 rounded-lg animate-pulse [animation-delay:0.2s]"></div>
                </div>
            </Card>
        );
    }
    
    if (insights.length === 0) {
        return null; // Don't show anything if there are no insights
    }

    return (
        <Card className="mb-6">
            <h2 className="text-xl font-semibold text-brand-secondary mb-4 flex items-center">
                <SparklesIcon className="w-6 h-6 mr-2"/>
                Observaciones de tu Coach IA
            </h2>
            <div className="space-y-4">
                {insights.map((insight, index) => {
                    const Icon = ICONS[insight.type];
                    return (
                        <div key={index} className={`flex flex-col p-4 rounded-lg border-l-4 ${COLORS[insight.type]} bg-gray-900/60`}>
                            <div className="flex items-center mb-2">
                                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                <h3 className="font-bold text-white">{insight.title}</h3>
                            </div>
                            <p className="text-gray-300 text-sm ml-8">{insight.message}</p>
                            {insight.tip && (
                                <p className="text-brand-accent text-sm ml-8 mt-2 font-semibold">{insight.tip}</p>
                            )}
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};

export default AIInsightsPanel;
