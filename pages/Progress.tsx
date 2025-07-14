import React, { useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';
import { useForm, SubmitHandler } from 'react-hook-form';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { BodyMeasurement, User } from '../types';
import { calculateMacros } from '../services/nutritionService';
import AIInsightsPanel from '../components/ai/AIInsightsPanel';


type MeasurementFormData = Omit<BodyMeasurement, 'date'>;

// Brzycki formula for 1RM estimation
const calculateE1RM = (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    if (reps < 1 || reps > 36) return 0; // Formula is unstable for high reps
    return weight / (1.0278 - (0.0278 * reps));
};

// --- Sub-components ---

const KeyMetricsPanel: React.FC<{ user: User }> = ({ user }) => {
    const metrics = useMemo(() => {
        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);

        // Training Metrics
        const recentWorkouts = user.workoutLog.filter(w => new Date(w.date) >= oneWeekAgo);
        const loggedDays = new Set(recentWorkouts.map(w => new Date(w.date).toISOString().split('T')[0])).size;
        const adherence = user.profile.trainingDays > 0 ? (loggedDays / user.profile.trainingDays) * 100 : 0;
        const totalVolume = recentWorkouts.reduce((sum, log) => sum + log.sets.reduce((setSum, s) => setSum + s.weight * s.reps, 0), 0);
        const allSets = recentWorkouts.flatMap(w => w.sets);
        const avgRPE = allSets.length > 0 ? allSets.reduce((sum, s) => sum + s.rpe, 0) / allSets.length : 0;
        
        // Nutrition Metrics
        const recentNutrition = user.nutritionLog.filter(n => new Date(n.date) >= oneWeekAgo);
        const targetMacros = calculateMacros(user.profile);
        const dailyCalories = recentNutrition.map(n => n.meals.reduce((sum, m) => sum + m.calories, 0));
        const caloricAdherence = dailyCalories.length > 0 ? (dailyCalories.reduce((sum, cals) => sum + (cals/targetMacros.calories), 0) / dailyCalories.length) * 100 : 0;

        const totalP = recentNutrition.reduce((sum, n) => sum + n.meals.reduce((mealSum, m) => mealSum + m.protein, 0), 0);
        const totalC = recentNutrition.reduce((sum, n) => sum + n.meals.reduce((mealSum, m) => mealSum + m.carbs, 0), 0);
        const totalF = recentNutrition.reduce((sum, n) => sum + n.meals.reduce((mealSum, m) => mealSum + m.fat, 0), 0);
        
        const proteinPerKg = recentNutrition.length > 0 ? (totalP / recentNutrition.length) / user.profile.weight : 0;

        return { adherence, totalVolume, avgRPE, caloricAdherence, proteinPerKg };

    }, [user]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
                <h3 className="text-lg font-semibold text-brand-secondary mb-4">Métricas de Entrenamiento</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span>Adherencia al Plan:</span> <span className="font-bold text-white">{metrics.adherence.toFixed(0)}%</span></div>
                    <div className="flex justify-between"><span>Volumen Semanal:</span> <span className="font-bold text-white">{metrics.totalVolume.toFixed(0)} kg</span></div>
                    <div className="flex justify-between"><span>Intensidad Media (RPE):</span> <span className="font-bold text-white">{metrics.avgRPE.toFixed(1)}</span></div>
                </div>
            </Card>
            <Card>
                <h3 className="text-lg font-semibold text-brand-secondary mb-4">Métricas de Nutrición</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span>Adherencia Calórica:</span> <span className="font-bold text-white">{metrics.caloricAdherence.toFixed(0)}%</span></div>
                     <div className="flex justify-between"><span>Proteína / kg:</span> <span className="font-bold text-white">{metrics.proteinPerKg.toFixed(1)} g</span></div>
                </div>
            </Card>
        </div>
    );
};


// --- Main Page Component ---
const Progress: React.FC = () => {
    const { activeUser: user, updateUser } = useUser();
    const { register, handleSubmit, reset } = useForm<MeasurementFormData>();
    const [selectedExercise, setSelectedExercise] = useState<string>('');
    
    const onLogMeasurement: SubmitHandler<MeasurementFormData> = (data) => {
        if (user && (data.arm || data.waist || data.leg || data.neck || data.bodyFat)) {
            const newMeasurement: BodyMeasurement = {
                date: new Date().toISOString(),
                arm: data.arm ? Number(data.arm) : undefined,
                waist: data.waist ? Number(data.waist) : undefined,
                leg: data.leg ? Number(data.leg) : undefined,
                neck: data.neck ? Number(data.neck) : undefined,
                bodyFat: data.bodyFat ? Number(data.bodyFat) : undefined,
            };
            
            // This assumes weight is updated via profile settings, if not, we should add a weight field here too.
            // For now, let's assume weight is current from profile
            const currentWeight = user.profile.weight;
            
            const updatedUser = {
                ...user,
                bodyMeasurements: [...user.bodyMeasurements, newMeasurement],
                // Add a new weight entry only if it differs from the last one or is a new day
                weightHistory: [...user.weightHistory, {date: newMeasurement.date, weight: currentWeight}],
            };
            updateUser(updatedUser);
            reset();
        }
    };
    
    const loggedExercises = useMemo(() => {
        if (!user) return [];
        return [...new Set(user.workoutLog.map(log => log.exercise))].sort();
    }, [user]);

    const strengthProgressData = useMemo(() => {
        if (!user || !selectedExercise) return [];
        
        return user.workoutLog
            .filter(log => log.exercise === selectedExercise)
            .map(log => {
                const topSet = log.sets.reduce((maxSet, currentSet) => calculateE1RM(currentSet.weight, currentSet.reps) > calculateE1RM(maxSet.weight, maxSet.reps) ? currentSet : maxSet, log.sets[0]);
                return {
                    date: new Date(log.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                    e1RM: parseFloat(calculateE1RM(topSet.weight, topSet.reps).toFixed(1)),
                };
            })
            .filter(d => d.e1RM > 0)
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [user, selectedExercise]);
    
    const caloriesHistoryData = useMemo(() => {
        if(!user) return [];
        const target = calculateMacros(user.profile).calories;
        return user.nutritionLog.map(log => ({
            date: new Date(log.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
            Consumidas: log.meals.reduce((sum, meal) => sum + meal.calories, 0),
            Objetivo: target,
        })).slice(-30); // Last 30 entries
    }, [user]);

    const weeklyVolumeData = useMemo(() => {
        if(!user) return [];
        const weeklyData: {[week: string]: number} = {};
        user.workoutLog.forEach(log => {
            const date = new Date(log.date);
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay() + 1)).toISOString().split('T')[0];
            const volume = log.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
            if(!weeklyData[weekStart]) weeklyData[weekStart] = 0;
            weeklyData[weekStart] += volume;
        });
        return Object.entries(weeklyData).map(([date, volume]) => ({
            date: new Date(date).toLocaleDateString('es-ES', {month: 'short', day: 'numeric'}),
            Volumen: parseFloat(volume.toFixed(0)),
        })).slice(-12); // Last 12 weeks
    }, [user]);

    if (!user) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Tu Panel de Progreso</h1>
            
            <AIInsightsPanel />

            <KeyMetricsPanel user={user} />
            
            <Card className="mb-6">
                <h2 className="text-xl font-semibold text-brand-secondary mb-4">Registrar Medidas Corporales</h2>
                <form onSubmit={handleSubmit(onLogMeasurement)} className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
                    <input type="number" step="0.1" {...register('arm')} placeholder="Brazo (cm)" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" step="0.1" {...register('waist')} placeholder="Cintura (cm)" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" step="0.1" {...register('leg')} placeholder="Pierna (cm)" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" step="0.1" {...register('neck')} placeholder="Cuello (cm)" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" step="0.1" {...register('bodyFat')} placeholder="Grasa (%)" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white" />
                    <Button type="submit" className="w-full">Registrar</Button>
                </form>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <h2 className="text-xl font-semibold text-brand-secondary mb-4">Historial de Calorías</h2>
                     {caloriesHistoryData.length > 1 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={caloriesHistoryData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                    <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} />
                                    <YAxis stroke="#A0AEC0" unit="kcal" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1A202C' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Consumidas" stroke="#00A9FF" strokeWidth={2} />
                                    <Line type="monotone" dataKey="Objetivo" stroke="#FBBF24" strokeWidth={2} strokeDasharray="5 5" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <p className="text-center text-gray-400">Registra tu nutrición para ver el historial.</p>}
                </Card>
                <Card>
                    <h2 className="text-xl font-semibold text-brand-secondary mb-4">Volumen de Entrenamiento Semanal</h2>
                     {weeklyVolumeData.length > 1 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={weeklyVolumeData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                    <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} />
                                    <YAxis stroke="#A0AEC0" unit="kg" fontSize={12}/>
                                    <Tooltip contentStyle={{ backgroundColor: '#1A202C' }} />
                                    <Bar dataKey="Volumen" fill="#00A9FF" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <p className="text-center text-gray-400">Registra tus entrenos para ver el historial.</p>}
                </Card>

                <Card>
                    <h2 className="text-xl font-semibold text-brand-secondary mb-4">Progresión de Fuerza (1RM Estimado)</h2>
                     <select
                        value={selectedExercise}
                        onChange={(e) => setSelectedExercise(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary mb-4"
                    >
                        <option value="">Selecciona un ejercicio...</option>
                        {loggedExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                    {selectedExercise && (strengthProgressData.length > 1 ? (
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <LineChart data={strengthProgressData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                    <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} />
                                    <YAxis stroke="#A0AEC0" domain={['dataMin - 5', 'dataMax + 5']} unit="kg" fontSize={12}/>
                                    <Tooltip contentStyle={{ backgroundColor: '#1A202C' }}/>
                                    <Line type="monotone" dataKey="e1RM" name="1RM Estimado" stroke="#00A9FF" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : selectedExercise && <p className="text-center text-gray-400">Necesitas más registros.</p>
                </Card>

                 <Card>
                    <h2 className="text-xl font-semibold text-brand-secondary mb-4">Historial de Medidas (cm)</h2>
                    {user.bodyMeasurements.length > 1 ? (
                        <div style={{ width: '100%', height: 300 }}>
                           <ResponsiveContainer>
                                <LineChart data={user.bodyMeasurements.map(entry => ({
                                    date: new Date(entry.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                                    ...(entry.arm && { Brazo: entry.arm }),
                                    ...(entry.waist && { Cintura: entry.waist }),
                                    ...(entry.leg && { Pierna: entry.leg }),
                                    ...(entry.neck && { Cuello: entry.neck }),
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                    <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} />
                                    <YAxis stroke="#A0AEC0" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1A202C' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Brazo" stroke="#FBBF24" connectNulls />
                                    <Line type="monotone" dataKey="Cintura" stroke="#F87171" connectNulls />
                                    <Line type="monotone" dataKey="Pierna" stroke="#C084FC" connectNulls />
                                    <Line type="monotone" dataKey="Cuello" stroke="#67E8F9" connectNulls />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <p className="text-center text-gray-400">Registra tus medidas para ver el historial.</p>}
                </Card>
            </div>
        </div>
    );
};


export default Progress;
