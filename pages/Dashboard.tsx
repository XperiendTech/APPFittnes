
import React from 'react';
import { useUser } from '../context/UserContext';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { DumbbellIcon, AppleIcon } from '../components/icons/Icons';
import AIInsightsPanel from '../components/ai/AIInsightsPanel';

const Dashboard: React.FC = () => {
  const { activeUser } = useUser();
  const navigate = useNavigate();

  if (!activeUser) return null;

  const { name } = activeUser.profile;
  
  const today = new Date();
  const weekDay = today.toLocaleString('es-ES', { weekday: 'long' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
            <h1 className="text-3xl font-bold text-white">Hola, <span className="text-brand-primary">{name}</span>!</h1>
            <p className="text-brand-light">Listo para hoy, {weekDay}?</p>
        </div>
      </div>

      <AIInsightsPanel />

      <Card>
        <h2 className="text-xl font-semibold text-brand-secondary mb-4">Resumen Diario</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <DumbbellIcon className="w-6 h-6 text-brand-primary mr-3" />
              <h3 className="text-lg font-semibold text-white">Entrenamiento</h3>
            </div>
            <p className="text-gray-300 mb-4">Consulta tu plan semanal y registra tu sesión.</p>
            <Button onClick={() => navigate('/workout')} className="w-full">Ir a Entreno</Button>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <AppleIcon className="w-6 h-6 text-brand-primary mr-3" />
              <h3 className="text-lg font-semibold text-white">Nutrición</h3>
            </div>
            <p className="text-gray-300 mb-4">Registra tus comidas y analiza tu progreso semanal.</p>
             <Button onClick={() => navigate('/nutrition')} className="w-full">Ir a Nutrición</Button>
          </div>
        </div>
      </Card>
      
      <Card>
        <h2 className="text-xl font-semibold text-brand-secondary mb-4">Gestión de Cuenta</h2>
        <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="secondary" onClick={() => navigate('/settings')} className="w-full">
                Editar Perfil
            </Button>
            <Button variant="secondary" onClick={() => navigate('/profiles')} className="w-full">
                Cambiar de Perfil
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;