import React, { useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User } from '../types';
import ExportPDFButton from '../components/ui/ExportPDFButton';
import { PinIcon, TrashIcon, ArrowLeftIcon, SearchIcon, SortAscendingIcon, UserPlusIcon, CalendarIcon, DumbbellIcon } from '../components/icons/Icons';

const DeleteUserModal: React.FC<{ user: User, onConfirm: () => void, onCancel: () => void }> = ({ user, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
                <h2 className="text-xl font-bold text-red-500 mb-2">Confirmar Eliminación</h2>
                <p className="text-gray-300 mb-6">¿Estás seguro de que quieres eliminar el perfil de <span className="font-bold">{user.profile.name}</span>? Esta acción es irreversible.</p>
                <div className="flex justify-end space-x-4">
                    <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={onConfirm}>Eliminar Perfil</Button>
                </div>
            </Card>
        </div>
    );
};

// New Profile Card component
const ProfileCard: React.FC<{
    user: User;
    onLoad: (id: string) => void;
    onDelete: (user: User) => void;
    onTogglePin: (id: string) => void;
}> = ({ user, onLoad, onDelete, onTogglePin }) => {

    const lastUsedDate = user.lastUsed ? new Date(user.lastUsed) : null;
    const timeAgo = (date: Date | null): string => {
        if (!date) return 'Nunca';
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `hace ${Math.floor(interval)} años`;
        interval = seconds / 2592000;
        if (interval > 1) return `hace ${Math.floor(interval)} meses`;
        interval = seconds / 86400;
        if (interval > 1) return `hace ${Math.floor(interval)} días`;
        interval = seconds / 3600;
        if (interval > 1) return `hace ${Math.floor(interval)} horas`;
        interval = seconds / 60;
        if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
        return 'justo ahora';
    };

    const workoutsThisWeek = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Set(user.workoutLog.filter(log => new Date(log.date) > oneWeekAgo).map(log => log.date.split('T')[0])).size;
    }, [user.workoutLog]);

    return (
        <Card className={`transition-all duration-300 border-l-4 ${user.pinned ? 'border-brand-primary bg-gray-700/50' : 'border-transparent'}`}>
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Left side: Info */}
                <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-white">{user.profile.name}</h2>
                        <span className="text-xs font-semibold px-2 py-1 bg-brand-primary/20 text-brand-light rounded-full">{user.profile.goal}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1.5"><DumbbellIcon className="w-4 h-4" />{workoutsThisWeek} / {user.profile.trainingDays} entrenos esta semana</span>
                        <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" />Último uso: {timeAgo(lastUsedDate)}</span>
                    </div>
                </div>

                {/* Right side: Actions */}
                <div className="flex-shrink-0 flex items-center justify-center sm:justify-end gap-2">
                    <button onClick={() => onTogglePin(user.id)} className={`p-2 rounded-full transition-colors ${user.pinned ? 'bg-brand-primary text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-500'}`} title={user.pinned ? 'Desfijar perfil' : 'Fijar perfil'}>
                        <PinIcon className="w-5 h-5"/>
                    </button>
                    <ExportPDFButton user={user} />
                    <button onClick={() => onDelete(user)} className="p-2 rounded-full bg-gray-600 text-gray-300 hover:bg-red-500 hover:text-white transition-colors" title="Eliminar perfil">
                        <TrashIcon className="w-5 h-5"/>
                    </button>
                    <Button onClick={() => onLoad(user.id)}>Cargar</Button>
                </div>
            </div>
        </Card>
    );
};


const ProfileManager: React.FC = () => {
    const { users, setActiveUser, deleteUser, togglePinUser, activeUser } = useUser();
    const navigate = useNavigate();
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'pinned' | 'name' | 'lastUsed'>('pinned');

    const handleLoadProfile = (userId: string) => {
        setActiveUser(userId);
        navigate('/');
    };

    const handleCreateProfile = () => {
        navigate('/setup');
    };
    
    const confirmDelete = () => {
        if (userToDelete) {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
        }
    };
    
    const filteredAndSortedUsers = useMemo(() => {
        let processedUsers = users.filter(u => u.profile.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        processedUsers.sort((a, b) => {
            if (sortBy === 'pinned') {
                if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            }
            if (sortBy === 'name') {
                return a.profile.name.localeCompare(b.profile.name);
            }
            if (sortBy === 'lastUsed') {
                const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
                const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
                return dateB - dateA; // most recent first
            }
            // Default secondary sort for 'pinned'
            const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0;
            const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0;
            return dateB - dateA;
        });

        return processedUsers;

    }, [users, searchTerm, sortBy]);

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center p-4 sm:p-6">
            <div className="w-full max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white flex items-center gap-4">
                        {activeUser && (
                            <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Volver al inicio">
                                <ArrowLeftIcon className="w-6 h-6 text-brand-primary"/>
                            </button>
                        )}
                        Gestor de Perfiles
                    </h1>
                     <Button onClick={handleCreateProfile} className="flex items-center gap-2">
                        <UserPlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Crear Perfil</span>
                    </Button>
                </div>
                
                <Card className="mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-grow">
                             <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <SearchIcon className="w-5 h-5 text-gray-400"/>
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar perfil por nombre..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 pl-10 text-white focus:ring-brand-primary focus:border-brand-primary"
                            />
                        </div>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <SortAscendingIcon className="w-5 h-5 text-gray-400"/>
                            </span>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value as any)}
                                className="w-full sm:w-auto bg-gray-700 border border-gray-600 rounded-lg p-2.5 pl-10 text-white focus:ring-brand-primary focus:border-brand-primary appearance-none"
                            >
                                <option value="pinned">Ordenar por Fijados</option>
                                <option value="name">Ordenar por Nombre</option>
                                <option value="lastUsed">Ordenar por Recientes</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {filteredAndSortedUsers.length > 0 ? (
                    <div className="space-y-4">
                        {filteredAndSortedUsers.map(user => (
                           <ProfileCard
                                key={user.id}
                                user={user}
                                onLoad={handleLoadProfile}
                                onDelete={setUserToDelete}
                                onTogglePin={togglePinUser}
                           />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-10">
                        <h3 className="text-lg text-gray-400">No se encontraron perfiles.</h3>
                        <p className="text-gray-500 mt-2">¿Por qué no creas uno nuevo?</p>
                    </Card>
                )}

            </div>

            {userToDelete && (
                <DeleteUserModal 
                    user={userToDelete} 
                    onConfirm={confirmDelete}
                    onCancel={() => setUserToDelete(null)}
                />
            )}
        </div>
    );
};

export default ProfileManager;