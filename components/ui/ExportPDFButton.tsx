import React, { useState } from 'react';
import { User } from '../../types';
import { generateProgressReport } from '../../services/pdfService';
import Button from './Button';

interface ExportPDFButtonProps {
    user: User;
}

const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({ user }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            await generateProgressReport(user);
        } catch (error) {
            console.error("Failed to generate PDF report:", error);
            alert("Hubo un error al generar el informe en PDF.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            size="sm"
            variant="secondary"
            onClick={handleExport}
            disabled={isLoading}
        >
            {isLoading ? 'Generando...' : 'Exportar PDF'}
        </Button>
    );
};

export default ExportPDFButton;
