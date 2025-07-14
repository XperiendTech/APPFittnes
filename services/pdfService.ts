import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { User } from '../types';
import { calculateMacros } from './nutritionService';
import { APP_NAME } from '../constants';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// Extending jsPDF with autoTable using a type intersection for better type composition
type jsPDFWithAutoTable = jsPDF & {
  autoTable: (options: any) => jsPDF;
};

const generateProgressReport = async (user: User) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const { profile, weightHistory } = user;
    const targetMacros = calculateMacros(profile);

    // --- Page 1: Title Page & Profile Summary ---
    doc.setFontSize(28);
    doc.setTextColor('#00A9FF');
    doc.text(APP_NAME, doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor('#0A1D38');
    doc.text(`Informe de Progreso de ${profile.name}`, doc.internal.pageSize.getWidth() / 2, 45, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor('#333333');
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, doc.internal.pageSize.getWidth() / 2, 55, { align: 'center' });

    doc.autoTable({
        startY: 70,
        head: [['Métrica', 'Valor']],
        body: [
            ['Objetivo', profile.goal],
            ['Peso Actual', `${profile.weight} kg`],
            ['Altura', `${profile.height} cm`],
            ['% Grasa Corporal', `${profile.bodyFat.toFixed(1)}%`],
            ['Objetivo Calórico', `${targetMacros.calories.toFixed(0)} kcal`],
            ['Proteínas', `${targetMacros.protein.toFixed(0)} g`],
            ['Carbohidratos', `${targetMacros.carbs.toFixed(0)} g`],
            ['Grasas', `${targetMacros.fat.toFixed(0)} g`],
        ],
        theme: 'grid',
        headStyles: { fillColor: '#00A9FF' },
    });
    
    // --- Page 2: Charts ---
    if (weightHistory.length > 1) {
        doc.addPage();
        doc.setFontSize(18);
        doc.setTextColor('#0A1D38');
        doc.text("Gráficas de Progreso", 14, 20);
    }

    // Helper to render chart and add to PDF
    const addChartToPdf = async (elementId: string, title: string, yPos: number): Promise<number> => {
        const chartElement = document.getElementById(elementId);
        if (!chartElement) return yPos;

        // This ensures the DOM is updated before html2canvas runs
        await new Promise(resolve => requestAnimationFrame(resolve));

        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(chartElement, { backgroundColor: '#ffffff' });
        const imgData = canvas.toDataURL('image/png');
        
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth() - 28;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        doc.setFontSize(14);
        doc.text(title, 14, yPos);
        doc.addImage(imgData, 'PNG', 14, yPos + 5, pdfWidth, pdfHeight);

        return yPos + pdfHeight + 20;
    };

    // Need a hidden container to render charts
    let chartContainer = document.getElementById('pdf-chart-container');
    if (!chartContainer) {
        chartContainer = document.createElement('div');
        chartContainer.id = 'pdf-chart-container';
        chartContainer.style.position = 'fixed';
        chartContainer.style.top = '-9999px';
        chartContainer.style.left = '-9999px';
        document.body.appendChild(chartContainer);
    }
    
    // --- Prepare and render charts ---
    const ChartComponent: React.FC<{data: any[], dataKey: string, name: string, unit: string}> = ({ data, dataKey, name, unit }) => (
        React.createElement('div', { style: { width: 500, height: 250, backgroundColor: 'white', padding: '10px' } },
            React.createElement(ResponsiveContainer, {},
                React.createElement(LineChart, { data, margin: { top: 5, right: 20, left: -10, bottom: 5 }, isAnimationActive: false },
                    React.createElement(CartesianGrid, { strokeDasharray: "3 3" }),
                    React.createElement(XAxis, { dataKey: "date", fontSize: 10 }),
                    React.createElement(YAxis, { fontSize: 10, unit, domain: ['dataMin - 2', 'dataMax + 2'] }),
                    React.createElement(Tooltip, {}),
                    React.createElement(Legend, {}),
                    React.createElement(Line, { type: "monotone", dataKey, name, stroke: "#00A9FF", strokeWidth: 2, dot: false })
                )
            )
        )
    );

    let currentY = 30;

    // 1. Weight History Chart
    if (weightHistory.length > 1) {
        const weightData = weightHistory.map(w => ({ date: new Date(w.date).toLocaleDateString('es-ES', {month:'short', day:'numeric'}), Peso: w.weight }));
        const weightChartId = 'weight-chart-pdf';
        const chartDiv = document.createElement('div');
        chartDiv.id = weightChartId;
        chartContainer.appendChild(chartDiv);

        const weightChartRoot = ReactDOM.createRoot(chartDiv);
        weightChartRoot.render(React.createElement(ChartComponent, { data: weightData, dataKey: "Peso", name: "Peso", unit: "kg" }));
        
        currentY = await addChartToPdf(weightChartId, 'Historial de Peso', currentY);
        
        // Cleanup
        weightChartRoot.unmount();
        chartContainer.removeChild(chartDiv);
    }

    doc.save(`${user.profile.name}_informe_progreso.pdf`);
    
    // Final cleanup of container
    if (chartContainer && !chartContainer.hasChildNodes()) {
        chartContainer.remove();
    }
};

export { generateProgressReport };