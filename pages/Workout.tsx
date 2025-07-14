import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { generateFullWeeklyPlan, getExerciseByName } from '../services/workoutService';
import { getExerciseAlternatives } from '../services/geminiService';
import { WorkoutPlan, WorkoutLog, WorkoutSet, Exercise, User, UserProfile, TrainingStyle } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { DumbbellIcon, ChartBarIcon, SparklesIcon } from '../components/icons/Icons';

// --- Helper Functions ---
const getStartOfWeek = (date: Date): Date => {
    const dateCopy = new Date(date);
    const day = dateCopy.getDay();
    const diff = dateCopy.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(dateCopy.setDate(diff));
};

// --- Components ---

interface SetLog extends Omit<WorkoutSet, 'reps' | 'weight' | 'rpe'> {
  reps: string;
  weight: string;
  rpe: string;
}

const ExerciseCard: React.FC<{
  exerciseData: WorkoutPlan['exercises'][0],
  onLog: (log: WorkoutLog) => void,
  onSubstitute: (originalExerciseId: string, newExercise: Exercise) => void,
  history: WorkoutLog[],
}> = ({ exerciseData, onLog, onSubstitute, history }) => {
  const { exercise, sets: targetSets } = exerciseData;
  const { activeUser: user } = useUser();
  const todayStr = new Date().toISOString().split('T')[0];
  const [showSubstitutions, setShowSubstitutions] = useState(false);
  
  const todaysLog = useMemo(() => 
    history.find(log => log.exercise === exercise.name && log.date.startsWith(todayStr))
  , [history, exercise.name, todayStr]);

  const getInitialSets = useCallback(() => {
    let initialSets: SetLog[] = todaysLog 
      ? todaysLog.sets.map(s => ({ reps: String(s.reps), weight: String(s.weight), rpe: String(s.rpe) }))
      : Array(targetSets).fill({ reps: '', weight: '', rpe: '' });
    return initialSets;
  }, [todaysLog, targetSets]);

  const [sets, setSets] = useState<SetLog[]>(getInitialSets());
  const [isLocked, setIsLocked] = useState(!!todaysLog);

  useEffect(() => {
    setSets(getInitialSets());
    setIsLocked(!!todaysLog);
  }, [todaysLog, getInitialSets, exerciseData]);

  const lastPerformance = useMemo(() => {
    return history
      .filter(log => log.exercise === exercise.name && !log.date.startsWith(todayStr))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null;
  }, [history, exercise.name, todayStr]);

  const performanceTip = useMemo(() => {
    if (!lastPerformance || lastPerformance.sets.length === 0) return "¡Primera vez! Concéntrate en la técnica.";
    const topSet = [...lastPerformance.sets].sort((a, b) => b.weight - a.weight)[0];
    if (topSet.rpe < 7) {
        return `Sugerencia: Sube 2.5-5kg respecto a la última vez (${topSet.weight}kg).`;
    }
    if (topSet.rpe >= 7 && topSet.rpe < 9) {
        return `Sugerencia: Intenta añadir una repetición más con el mismo peso (${topSet.weight}kg).`;
    }
    return `Sugerencia: El objetivo es igualar o superar ${topSet.weight}kg x ${topSet.reps} reps. ¡Puedes hacerlo!`;
  }, [lastPerformance]);

  const techniqueTip = useMemo(() => {
    if (!user) return "";
    const { trainingStyle } = user.profile;
    switch (trainingStyle) {
        case TrainingStyle.HYPERTROPHY:
            return "Controla la fase excéntrica (bajada) durante 3 segundos para maximizar la tensión.";
        case TrainingStyle.STRENGTH:
             return "Prioriza la velocidad y la intención en la fase concéntrica (subida). Cada repetición debe ser explosiva.";
        case TrainingStyle.BODYBUILDING:
            return "Conexión mente-músculo: siente y aprieta el músculo objetivo en cada repetición.";
        case TrainingStyle.POWERBUILDING:
            const isPowerLift = exerciseData.reps.includes('4-6') || exerciseData.reps.includes('5-5') || exerciseData.reps.includes('3-5');
            if (isPowerLift) {
                return "Foco en la explosividad en la fase concéntrica (subida) manteniendo la técnica estricta.";
            }
            return "Mantén la tensión en los accesorios, busca el bombeo muscular.";
        case TrainingStyle.CALISTHENICS:
            return "La calidad del movimiento es clave. Realiza cada repetición de forma controlada y completa.";
        default:
            return "Concéntrate en una técnica impecable en cada serie y repetición.";
    }
}, [user, exerciseData.reps]);

  const handleSetChange = (index: number, field: keyof SetLog, value: string) => {
    const newSets = [...sets];
    newSets[index] = { ...newSets[index], [field]: value };
    setSets(newSets);
  };

  const handleLogExercise = () => {
    const loggedSets = sets
      .filter(s => s.reps && s.weight && s.rpe)
      .map(s => ({ reps: Number(s.reps), weight: Number(s.weight), rpe: Number(s.rpe) }));
      
    if (loggedSets.length > 0) {
      onLog({
        date: new Date().toISOString(),
        exercise: exercise.name,
        sets: loggedSets,
        muscleGroup: exercise.muscleGroup,
      });
      setIsLocked(true);
    } else {
        alert("Por favor, rellena al menos una serie para registrar el ejercicio.");
    }
  };
  
  const handleSubstitute = (newExerciseName: string) => {
      const newExercise = getExerciseByName(newExerciseName);
      if(newExercise) {
          onSubstitute(exercise.id, newExercise);
      }
      setShowSubstitutions(false);
  };
  
  const buttonText = isLocked ? 'Editar' : (todaysLog ? 'Actualizar' : 'Registrar');
  const buttonAction = isLocked ? () => setIsLocked(false) : handleLogExercise;

  return (
    <Card className={`mb-4 transition-all duration-300 ${isLocked ? 'border-green-500/70 opacity-90' : 'border-gray-700'}`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-brand-primary">{exercise.name}</h3>
                <p className="text-sm text-brand-light mb-2">{exercise.muscleGroup}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setShowSubstitutions(true)}>Sustituir</Button>
        </div>
      
        <div className="space-y-3 my-4">
            <div className="bg-gray-900/50 p-3 rounded-lg">
                <p className="font-semibold text-brand-light flex items-center gap-2"><ChartBarIcon className="w-4 h-4" /> Tip de Progresión</p>
                <p className="text-sm text-gray-300 pl-6 italic">{performanceTip}</p>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg">
                <p className="font-semibold text-brand-accent flex items-center gap-2"><SparklesIcon className="w-4 h-4" /> Foco de la Técnica</p>
                <p className="text-sm text-gray-300 pl-6 italic">{techniqueTip}</p>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center bg-gray-700/60 p-2 rounded-lg mb-4">
            <div><p className="text-white font-semibold">{targetSets}</p><p className="text-xs text-gray-400">Series</p></div>
            <div><p className="text-white font-semibold">{exerciseData.reps}</p><p className="text-xs text-gray-400">Reps</p></div>
            <div><p className="text-white font-semibold">{exerciseData.rest}s</p><p className="text-xs text-gray-400">Descanso</p></div>
        </div>
      
      <div className="space-y-3">
        {sets.map((set, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <span className="font-bold text-gray-400 text-center col-span-1">{index + 1}</span>
            <input type="number" placeholder="kg" value={set.weight} onChange={(e) => handleSetChange(index, 'weight', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white col-span-4" disabled={isLocked} />
            <input type="number" placeholder="reps" value={set.reps} onChange={(e) => handleSetChange(index, 'reps', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white col-span-4" disabled={isLocked} />
            <input type="number" placeholder="1-10" value={set.rpe} onChange={(e) => handleSetChange(index, 'rpe', e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white col-span-3" disabled={isLocked} />
          </div>
        ))}
      </div>
      <Button onClick={buttonAction} className="w-full mt-4" variant={isLocked ? 'secondary' : 'primary'}>
        {buttonText}
      </Button>
      {showSubstitutions && user && (
          <ExerciseSubstitutionModal 
              exercise={exercise} 
              userProfile={user.profile} 
              onSelect={handleSubstitute} 
              onClose={() => setShowSubstitutions(false)} 
          />
      )}
    </Card>
  );
};

const ExerciseSubstitutionModal: React.FC<{
    exercise: Exercise;
    userProfile: UserProfile;
    onSelect: (newExerciseName: string) => void;
    onClose: () => void;
}> = ({ exercise, userProfile, onSelect, onClose }) => {
    const [alternatives, setAlternatives] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAlternatives = async () => {
            setIsLoading(true);
            const alts = await getExerciseAlternatives(exercise, userProfile);
            setAlternatives(alts);
            setIsLoading(false);
        };
        fetchAlternatives();
    }, [exercise, userProfile]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-dark p-6 rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h4 className="text-xl font-bold text-brand-primary mb-2">Sustituir {exercise.name}</h4>
                <p className="text-gray-400 mb-4">Elige una alternativa sugerida por la IA:</p>
                {isLoading ? (
                    <div className="flex justify-center items-center h-24">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {alternatives.length > 0 ? alternatives.map(alt => (
                            <Button key={alt} variant="secondary" className="w-full text-left" onClick={() => onSelect(alt)}>
                                {alt}
                            </Button>
                        )) : <p className="text-center text-gray-500">No se encontraron alternativas.</p>}
                    </div>
                )}
                <Button onClick={onClose} className="w-full mt-6">Cancelar</Button>
            </div>
        </div>
    );
};


const ChooseWorkoutModal: React.FC<{
    plan: WorkoutPlan[],
    completedIdsThisWeek: string[],
    onSelect: (plan: WorkoutPlan) => void,
    onClose: () => void,
}> = ({ plan, completedIdsThisWeek, onSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-dark p-6 rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-brand-primary mb-4">Elige tu Entrenamiento</h3>
                <div className="space-y-3">
                    {plan.map(p => {
                        const isCompleted = completedIdsThisWeek.includes(p.id);
                        return (
                            <button
                                key={p.id}
                                onClick={() => onSelect(p)}
                                disabled={isCompleted}
                                className={`w-full p-4 rounded-lg text-left transition-colors flex justify-between items-center ${isCompleted ? 'bg-green-800/50 text-gray-500 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'}`}
                            >
                                <div>
                                    <p className={`font-bold ${isCompleted ? 'text-green-400' : 'text-white'}`}>{p.name}</p>
                                    <p className="text-xs text-gray-400">{p.muscleGroups.join(', ')}</p>
                                </div>
                                {isCompleted && <span className="text-green-400 font-bold text-sm">COMPLETADO</span>}
                            </button>
                        );
                    })}
                </div>
                 <Button onClick={onClose} variant="secondary" className="w-full mt-6">Cerrar</Button>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const Workout: React.FC = () => {
    const { activeUser: user, updateUser } = useUser();
    const [activeWorkout, setActiveWorkout] = useState<WorkoutPlan | null>(null);
    const [isChoosingWorkout, setIsChoosingWorkout] = useState(false);
    const [selectedTrainingStyle, setSelectedTrainingStyle] = useState<TrainingStyle>(() => user?.profile.trainingStyle || TrainingStyle.HYPERTROPHY);

    useEffect(() => {
        if (user) {
            setSelectedTrainingStyle(user.profile.trainingStyle);
        }
    }, [user]);

    const handleGeneratePlan = () => {
        if (user) {
            const profileWithNewStyle: UserProfile = {
                ...user.profile,
                trainingStyle: selectedTrainingStyle
            };

            const newPlan = generateFullWeeklyPlan(profileWithNewStyle);

            updateUser({
                ...user,
                profile: profileWithNewStyle,
                weeklyWorkoutPlan: newPlan
            });

            setActiveWorkout(null);
            alert(`¡Nuevo plan de entrenamiento de estilo '${selectedTrainingStyle}' generado!`);
        }
    };

    const handleLogExercise = (log: WorkoutLog) => {
        if (user) {
            const todayStr = new Date(log.date).toISOString().split('T')[0];
            const newWorkoutLog = [...user.workoutLog.filter(l => !(l.exercise === log.exercise && l.date.startsWith(todayStr))), log];
            updateUser({ ...user, workoutLog: newWorkoutLog });
        }
    };

    const handleSelectWorkout = (plan: WorkoutPlan) => {
        setActiveWorkout(plan);
        setIsChoosingWorkout(false);
    };

    const handleSubstituteExercise = (originalExerciseId: string, newExercise: Exercise) => {
        if (!user || !activeWorkout) return;

        const newActiveWorkout = { ...activeWorkout };
        const exerciseIndex = newActiveWorkout.exercises.findIndex(e => e.exercise.id === originalExerciseId);

        if (exerciseIndex > -1) {
            const originalExerciseData = newActiveWorkout.exercises[exerciseIndex];
            newActiveWorkout.exercises[exerciseIndex] = {
                ...originalExerciseData,
                exercise: newExercise,
            };

            const newWeeklyPlan = user.weeklyWorkoutPlan?.map(plan =>
                plan.id === newActiveWorkout.id ? newActiveWorkout : plan
            ) || null;

            setActiveWorkout(newActiveWorkout);
            updateUser({ ...user, weeklyWorkoutPlan: newWeeklyPlan });
        }
    };

    const completedWorkoutsThisWeek = useMemo(() => {
        if (!user) return [];
        const startOfWeek = getStartOfWeek(new Date());
        const relevantLogs = user.workoutLog.filter(log => new Date(log.date) >= startOfWeek);

        const completedWorkoutIds: string[] = [];
        user.weeklyWorkoutPlan?.forEach(plan => {
            const planExercises = plan.exercises.map(ex => ex.exercise.name);
            const loggedExercisesForPlan = relevantLogs.filter(log => planExercises.includes(log.exercise));
            if (loggedExercisesForPlan.length > 0) {
                completedWorkoutIds.push(plan.id);
            }
        });
        return [...new Set(completedWorkoutIds)];
    }, [user]);

    if (!user) return <div className="text-center text-gray-400">Cargando...</div>;

    const weeklyPlan = user.weeklyWorkoutPlan;

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-4">Entrenamiento</h1>

            {!weeklyPlan ? (
                <Card className="text-center">
                    <h2 className="text-xl font-semibold text-brand-secondary mb-4">No tienes un plan activo</h2>
                    <p className="text-gray-300 mb-6">Selecciona un estilo y genera tu plan de entrenamiento personalizado.</p>

                    <div className="max-w-sm mx-auto mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-300">Estilo de Entrenamiento</label>
                        <select
                            value={selectedTrainingStyle}
                            onChange={(e) => setSelectedTrainingStyle(e.target.value as TrainingStyle)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary"
                        >
                            {Object.values(TrainingStyle).map(style => <option key={style} value={style}>{style}</option>)}
                        </select>
                    </div>

                    <Button onClick={handleGeneratePlan}>Generar Plan Semanal</Button>
                </Card>
            ) : (
                <>
                    <Card className="mb-6">
                        <h2 className="text-xl font-semibold text-brand-secondary mb-2">Entrenamiento de Hoy</h2>
                        {activeWorkout ? (
                            <p className="text-gray-300">Has seleccionado la rutina: <span className="font-bold text-brand-primary">{activeWorkout.name}</span>.</p>
                        ) : (
                            <p className="text-gray-300">Elige la rutina que quieres realizar hoy.</p>
                        )}
                        <Button onClick={() => setIsChoosingWorkout(true)} className="w-full mt-4">
                            {activeWorkout ? 'Cambiar Entrenamiento' : 'Elegir Entrenamiento'}
                        </Button>
                    </Card>

                    <div className="space-y-4">
                        {activeWorkout ? (
                            <>
                                <h2 className="text-2xl font-semibold text-brand-primary mb-4">{activeWorkout.name}</h2>
                                {activeWorkout.exercises.map((ex, index) => (
                                    <ExerciseCard
                                        key={`${ex.exercise.id}-${index}`}
                                        exerciseData={ex}
                                        onLog={handleLogExercise}
                                        onSubstitute={handleSubstituteExercise}
                                        history={user.workoutLog}
                                    />
                                ))}
                            </>
                        ) : (
                            <Card className="text-center py-10">
                                <DumbbellIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-400">Ningún entrenamiento seleccionado</h3>
                                <p className="text-gray-500">Haz clic en "Elegir Entrenamiento" para empezar.</p>
                            </Card>
                        )}
                    </div>

                    <Card className="mt-8">
                        <h2 className="text-xl font-semibold text-brand-secondary mb-4">Opciones de Planificación</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-300">Cambiar Estilo y Generar Nuevo Plan</label>
                                <select
                                    value={selectedTrainingStyle}
                                    onChange={(e) => setSelectedTrainingStyle(e.target.value as TrainingStyle)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary"
                                >
                                    {Object.values(TrainingStyle).map(style => <option key={style} value={style}>{style}</option>)}
                                </select>
                            </div>
                            <Button onClick={handleGeneratePlan} className="w-full">
                                Generar Nuevo Plan de {selectedTrainingStyle}
                            </Button>
                        </div>
                    </Card>

                    {isChoosingWorkout && (
                        <ChooseWorkoutModal
                            plan={weeklyPlan}
                            completedIdsThisWeek={completedWorkoutsThisWeek}
                            onSelect={handleSelectWorkout}
                            onClose={() => setIsChoosingWorkout(false)}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Workout;