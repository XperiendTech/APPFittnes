
import React, { useState, useMemo } from 'react';
import { getExercises } from '../services/workoutService';
import { Exercise, ExperienceLevel, Equipment } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const ExerciseDetailModal: React.FC<{ exercise: Exercise, onClose: () => void }> = ({ exercise, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-dark p-4 rounded-lg max-w-lg w-full" onClick={e => e.stopPropagation()}>
                <h4 className="text-xl font-bold text-brand-primary mb-2">{exercise.name}</h4>
                {exercise.videoUrl ? (
                    <img src={exercise.videoUrl} alt={`Demostración de ${exercise.name}`} className="rounded-lg w-full object-contain mb-4"/>
                ) : (
                    <div className="w-full aspect-video bg-gray-700 flex items-center justify-center rounded-lg mb-4">
                        <p className="text-gray-400">Sin video de demostración</p>
                    </div>
                )}
                <p className="text-gray-300 mb-4">{exercise.description}</p>
                <div className="flex justify-between text-sm text-gray-400 mb-4">
                    <span>Grupo: <span className="font-bold text-white">{exercise.muscleGroup}</span></span>
                    <span>Nivel: <span className="font-bold text-white">{exercise.level}</span></span>
                    <span>Equipo: <span className="font-bold text-white">{exercise.equipment}</span></span>
                </div>
                <Button onClick={onClose} className="w-full mt-4">Cerrar</Button>
            </div>
        </div>
    );
};

const Library: React.FC = () => {
    const [muscleGroupFilter, setMuscleGroupFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [equipmentFilter, setEquipmentFilter] = useState('');
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

    const filteredExercises = useMemo(() => {
        return getExercises({
            muscleGroup: muscleGroupFilter || undefined,
            level: levelFilter as ExperienceLevel || undefined,
            equipment: equipmentFilter as Equipment || undefined,
        });
    }, [muscleGroupFilter, levelFilter, equipmentFilter]);
    
    const muscleGroups = useMemo(() => [...new Set(getExercises({}).map(ex => ex.muscleGroup))].sort(), []);
    const levels = Object.values(ExperienceLevel);
    const equipments = Object.values(Equipment);

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Biblioteca de Ejercicios</h1>

            <Card className="mb-6">
                <h2 className="text-xl font-semibold text-brand-secondary mb-4">Filtros</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select onChange={e => setMuscleGroupFilter(e.target.value)} value={muscleGroupFilter} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white">
                        <option value="">Todos los Grupos</option>
                        {muscleGroups.map(mg => <option key={mg} value={mg}>{mg}</option>)}
                    </select>
                     <select onChange={e => setLevelFilter(e.target.value)} value={levelFilter} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white">
                        <option value="">Todos los Niveles</option>
                        {levels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                     <select onChange={e => setEquipmentFilter(e.target.value)} value={equipmentFilter} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white">
                        <option value="">Todo el Equipo</option>
                        {equipments.map(eq => <option key={eq} value={eq}>{eq}</option>)}
                    </select>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredExercises.map(ex => (
                    <Card key={ex.id} className="cursor-pointer hover:border-brand-primary transition-colors" onClick={() => setSelectedExercise(ex)}>
                        <h3 className="font-bold text-lg text-brand-primary">{ex.name}</h3>
                        <p className="text-sm text-brand-light">{ex.muscleGroup}</p>
                        <div className="mt-4 flex justify-between text-xs text-gray-400">
                           <span>{ex.level}</span>
                           <span>{ex.equipment}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {selectedExercise && <ExerciseDetailModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} />}
        </div>
    );
};

export default Library;
