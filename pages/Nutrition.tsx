
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { calculateMacros } from '../services/nutritionService';
import { getNutritionFromImage, generateDietPlan, getWeeklyNutritionAnalysis, getMealAlternative } from '../services/geminiService';
import { Meal, NutritionLog, Goal, GeneratedMeal } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useForm, SubmitHandler } from 'react-hook-form';
import { CameraIcon, SparklesIcon } from '../components/icons/Icons';
import CameraScanner from '../components/ui/CameraScanner';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';


// --- Sub-components ---

const MacroCircle: React.FC<{ label: string; value: number; total: number; unit: string; color: string }> = ({ label, value, total, unit, color }) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                    <circle
                        className={color}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-white">{Math.max(0, value).toFixed(0)}</span>
                    <span className="text-xs text-gray-400">/ {total.toFixed(0)}{unit}</span>
                </div>
            </div>
            <p className="mt-2 text-sm font-semibold">{label}</p>
        </div>
    );
};

const DailySummary: React.FC = () => {
    const { activeUser: user, updateUser } = useUser();
    const { register, handleSubmit, reset, setValue } = useForm<Meal>();
    
    const [isLogging, setIsLogging] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const progressIntervalRef = useRef<number | null>(null);

    const [mealToSubstitute, setMealToSubstitute] = useState<GeneratedMeal | null>(null);
    const [showShoppingList, setShowShoppingList] = useState(false);

    const targets = useMemo(() => {
        if (!user) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
        return calculateMacros(user.profile);
    }, [user]);

    const todayLog = useMemo(() => {
        if (!user) return null;
        const todayStr = new Date().toISOString().split('T')[0];
        return user.nutritionLog.find(log => log.date.startsWith(todayStr));
    }, [user]);

    const totals = useMemo(() => {
        let runningTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        // Add manually logged meals
        if (todayLog) {
            runningTotals = todayLog.meals.reduce((acc, meal) => ({
                calories: acc.calories + meal.calories,
                protein: acc.protein + meal.protein,
                carbs: acc.carbs + meal.carbs,
                fat: acc.fat + meal.fat,
            }), runningTotals);
        }
        // Add completed meals from the generated plan
        if (user?.dailyDietPlan) {
            runningTotals = user.dailyDietPlan.reduce((acc, meal) => {
                if (meal.completed) {
                    return {
                        calories: acc.calories + meal.calories,
                        protein: acc.protein + meal.protein,
                        carbs: acc.carbs + meal.carbs,
                        fat: acc.fat + meal.fat,
                    };
                }
                return acc;
            }, runningTotals);
        }
        return runningTotals;
    }, [todayLog, user?.dailyDietPlan]);

    const meals = useMemo(() => user?.dailyDietPlan?.filter(item => item.type === 'meal') || [], [user?.dailyDietPlan]);
    const supplements = useMemo(() => user?.dailyDietPlan?.filter(item => item.type === 'supplement') || [], [user?.dailyDietPlan]);
    

    if (!user) return null;

    const handleScanImage = async (base64Image: string) => {
        setIsScanning(true);
        setShowScanner(false);
        try {
            const nutritionData = await getNutritionFromImage(base64Image);
            if (nutritionData) {
                setValue('name', nutritionData.name || 'Alimento escaneado');
                setValue('calories', nutritionData.calories || 0);
                setValue('protein', nutritionData.protein || 0);
                setValue('carbs', nutritionData.carbs || 0);
                setValue('fat', nutritionData.fat || 0);
                setIsLogging(true);
            }
        } catch (error) {
            console.error("Error processing nutrition label:", error);
            alert("No se pudo analizar la etiqueta. Inténtalo de nuevo.");
        } finally {
            setIsScanning(false);
        }
    };
    
    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        setGenerationProgress(0);

        progressIntervalRef.current = window.setInterval(() => {
            setGenerationProgress(prev => {
                if (prev >= 95) {
                    clearInterval(progressIntervalRef.current!);
                    return 95;
                }
                return prev + 5;
            });
        }, 800);

        try {
            const plan = await generateDietPlan(user.profile, targets);
            if (plan) {
                const fullPlan: GeneratedMeal[] = plan.map(meal => ({
                    ...meal,
                    id: crypto.randomUUID(),
                    completed: false,
                }));
                updateUser({ ...user, dailyDietPlan: fullPlan });
            } else {
                 alert("No se pudo generar el plan de comidas. Inténtalo de nuevo.");
            }
        } catch (error) {
            console.error("Error generating diet plan:", error);
            alert("No se pudo generar el plan de comidas. Inténtalo de nuevo.");
        } finally {
            clearInterval(progressIntervalRef.current!);
            setGenerationProgress(100);
            setTimeout(() => {
                setIsGenerating(false);
                setGenerationProgress(0);
            }, 1000);
        }
    };

    const handleLogMeal: SubmitHandler<Meal> = (data) => {
        const newMeal: Meal = {
            name: data.name,
            calories: Number(data.calories),
            protein: Number(data.protein),
            carbs: Number(data.carbs),
            fat: Number(data.fat),
        };

        const todayStr = new Date().toISOString().split('T')[0];
        const existingLogIndex = user.nutritionLog.findIndex(log => log.date.startsWith(todayStr));
        let updatedLogs: NutritionLog[];

        if (existingLogIndex > -1) {
            updatedLogs = [...user.nutritionLog];
            updatedLogs[existingLogIndex].meals.push(newMeal);
        } else {
            updatedLogs = [...user.nutritionLog, { date: new Date().toISOString(), meals: [newMeal] }];
        }
        
        updateUser({ ...user, nutritionLog: updatedLogs });
        reset();
        setIsLogging(false);
    };

    const handleToggleMealComplete = (mealId: string) => {
        if (!user.dailyDietPlan) return;
        const updatedPlan = user.dailyDietPlan.map(meal => 
            meal.id === mealId ? { ...meal, completed: !meal.completed } : meal
        );
        updateUser({ ...user, dailyDietPlan: updatedPlan });
    };

    const handleSubstituteMeal = (newMealData: Omit<GeneratedMeal, 'id' | 'completed'>) => {
        if (!user.dailyDietPlan || !mealToSubstitute) return;
        const updatedPlan = user.dailyDietPlan.map(meal =>
            meal.id === mealToSubstitute.id
                ? { ...meal, ...newMealData, type: 'meal' } // Ensure type is correct
                : meal
        );
        updateUser({ ...user, dailyDietPlan: updatedPlan });
        setMealToSubstitute(null);
    };
    
    return (
      <div className="space-y-6">
          <Card>
              <h2 className="text-xl font-semibold text-brand-secondary mb-4">Tus Objetivos de Hoy</h2>
              <div className="flex justify-around flex-wrap gap-4">
                  <MacroCircle label="Calorías" value={totals.calories} total={targets.calories} unit="k" color="text-brand-primary" />
                  <MacroCircle label="Proteínas" value={totals.protein} total={targets.protein} unit="g" color="text-red-400" />
                  <MacroCircle label="Carbs" value={totals.carbs} total={targets.carbs} unit="g" color="text-yellow-400" />
                  <MacroCircle label="Grasas" value={totals.fat} total={targets.fat} unit="g" color="text-green-400" />
              </div>
          </Card>
          
          <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => setShowScanner(true)} disabled={isScanning || isGenerating} className="flex items-center justify-center gap-2">
                  <CameraIcon className="w-5 h-5"/>
                  {isScanning ? "Analizando..." : "Analizar Etiqueta"}
              </Button>
              <Button onClick={handleGeneratePlan} disabled={isGenerating} variant="secondary" className="flex items-center justify-center gap-2">
                  <SparklesIcon className="w-5 h-5"/>
                  {isGenerating ? "Generando Plan..." : (user.dailyDietPlan ? "Generar Nuevo Plan" : "Generar Plan de Comidas")}
              </Button>
          </div>

          {isGenerating && (
            <div className="mb-4 animate-fade-in">
                <p className="text-center text-sm text-brand-light mb-2">La IA está creando un plan delicioso y optimizado para ti...</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                        className="bg-brand-primary h-2.5 rounded-full transition-all duration-500 ease-linear"
                        style={{ width: `${generationProgress}%` }}
                    ></div>
                </div>
            </div>
           )}
          
           {user.dailyDietPlan && (
                <div className="space-y-6">
                    {meals.length > 0 && (
                        <Card className="animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-brand-secondary">Plan de Comidas de Hoy</h2>
                                <Button size="sm" onClick={() => setShowShoppingList(true)}>Lista de Compra</Button>
                            </div>
                            <div className="space-y-4">
                                {meals.map(meal => (
                                    <MealCard 
                                        key={meal.id} 
                                        meal={meal} 
                                        onToggleComplete={() => handleToggleMealComplete(meal.id)}
                                        onSubstitute={() => setMealToSubstitute(meal)}
                                    />
                                ))}
                            </div>
                        </Card>
                    )}
                    {supplements.length > 0 && (
                         <Card className="animate-fade-in">
                            <h2 className="text-xl font-semibold text-brand-secondary mb-4">Suplementación</h2>
                            <div className="space-y-4">
                                {supplements.map(supplement => (
                                    <MealCard 
                                        key={supplement.id} 
                                        meal={supplement} 
                                        onToggleComplete={() => handleToggleMealComplete(supplement.id)}
                                        onSubstitute={() => {}} // No substitution for supplements
                                    />
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}

          <Button onClick={() => setIsLogging(!isLogging)} className="w-full mb-6">
              {isLogging ? 'Cancelar Registro Manual' : 'Registrar Comida Manualmente'}
          </Button>

          {isLogging && (
              <Card className="animate-fade-in">
                  <form onSubmit={handleSubmit(handleLogMeal)} className="space-y-4">
                      <input {...register('name', { required: true })} placeholder="Nombre de la comida" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white" />
                      <div className="grid grid-cols-2 gap-4">
                          <input type="number" {...register('calories', { required: true, valueAsNumber: true })} placeholder="Calorías" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white" />
                          <input type="number" {...register('protein', { required: true, valueAsNumber: true })} placeholder="Proteínas (g)" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white" />
                          <input type="number" {...register('carbs', { required: true, valueAsNumber: true })} placeholder="Carbs (g)" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white" />
                          <input type="number" {...register('fat', { required: true, valueAsNumber: true })} placeholder="Grasas (g)" className="w-full bg-gray-700 border border-ray-600 rounded-lg p-2.5 text-white" />
                      </div>
                      <Button type="submit" className="w-full">Añadir Comida</Button>
                  </form>
              </Card>
          )}

          <Card className="mt-6">
              <h2 className="text-xl font-semibold text-brand-secondary mb-4">Comidas Registradas Manualmente Hoy</h2>
              {todayLog && todayLog.meals.length > 0 ? (
                  <ul className="space-y-2">
                      {todayLog.meals.map((meal, index) => (
                          <li key={index} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                              <span className="font-semibold text-white">{meal.name}</span>
                              <span className="text-sm text-gray-300">{meal.calories.toFixed(0)} kcal</span>
                          </li>
                      ))}
                  </ul>
              ) : (
                  <p className="text-gray-400 text-center">Aún no has registrado ninguna comida manual.</p>
              )}
          </Card>

          {showScanner && <CameraScanner onCapture={handleScanImage} onClose={() => setShowScanner(false)} />}
          {mealToSubstitute && (
            <MealSubstitutionModal
                meal={mealToSubstitute}
                onSelect={handleSubstituteMeal}
                onClose={() => setMealToSubstitute(null)}
            />
          )}
          {showShoppingList && user.dailyDietPlan && (
            <ShoppingListModal 
                plan={user.dailyDietPlan}
                onClose={() => setShowShoppingList(false)}
            />
          )}
      </div>
    );
};

const MealCard: React.FC<{ meal: GeneratedMeal, onToggleComplete: () => void, onSubstitute: () => void }> = ({ meal, onToggleComplete, onSubstitute }) => {
    return (
        <div className={`p-4 rounded-lg transition-all ${meal.completed ? 'bg-green-900/40 border-l-4 border-green-500' : 'bg-gray-700/50'}`}>
            <div className="flex justify-between items-start">
                <div className="flex-grow pr-4">
                    <h4 className="font-bold text-white">{meal.name}</h4>
                    <p className="text-xs text-gray-400 italic">{meal.ingredients.join(', ')}</p>
                </div>
                <div className="flex-shrink-0">
                     <label htmlFor={`meal-${meal.id}`} className="flex items-center cursor-pointer">
                        <input id={`meal-${meal.id}`} type="checkbox" checked={meal.completed} onChange={onToggleComplete} className="form-checkbox h-5 w-5 rounded bg-gray-800 text-brand-primary focus:ring-brand-primary border-gray-600" />
                    </label>
                </div>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-xs mt-3 pt-3 border-t border-gray-600/50">
                <div><span className="font-semibold text-brand-primary">{meal.calories.toFixed(0)}</span><p className="text-gray-400">kcal</p></div>
                <div><span className="font-semibold text-red-400">{meal.protein.toFixed(0)}g</span><p className="text-gray-400">Prot</p></div>
                <div><span className="font-semibold text-yellow-400">{meal.carbs.toFixed(0)}g</span><p className="text-gray-400">Carbs</p></div>
                <div><span className="font-semibold text-green-400">{meal.fat.toFixed(0)}g</span><p className="text-gray-400">Grasa</p></div>
            </div>
            {!meal.completed && meal.type === 'meal' && (
                 <Button variant="secondary" size="sm" className="w-full mt-4" onClick={onSubstitute}>Sustituir Comida</Button>
            )}
        </div>
    );
};

const MealSubstitutionModal: React.FC<{ meal: GeneratedMeal, onSelect: (newMeal: Omit<GeneratedMeal, 'id' | 'completed'>) => void, onClose: () => void }> = ({ meal, onSelect, onClose }) => {
    const { activeUser: user } = useUser();
    const [alternatives, setAlternatives] = useState<Omit<GeneratedMeal, 'id' | 'completed'>[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchAlternatives = async () => {
            setIsLoading(true);
            const alts = await getMealAlternative(user.profile, meal);
            setAlternatives(alts || []);
            setIsLoading(false);
        };
        fetchAlternatives();
    }, [user, meal]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-dark p-6 rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h4 className="text-xl font-bold text-brand-primary mb-2">Sustituir {meal.name}</h4>
                <p className="text-gray-400 mb-4">Elige una alternativa con macros similares:</p>
                {isLoading ? (
                    <div className="flex justify-center items-center h-48"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div></div>
                ) : (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                        {alternatives.length > 0 ? alternatives.map((alt, i) => (
                            <button key={i} className="w-full text-left bg-gray-800 hover:bg-gray-700 p-3 rounded-lg" onClick={() => onSelect(alt)}>
                                <p className="font-bold text-white">{alt.name}</p>
                                <p className="text-xs text-gray-400 italic">{alt.ingredients.join(', ')}</p>
                                <div className="grid grid-cols-4 gap-2 text-center text-xs mt-2">
                                    <span className="text-brand-primary">{alt.calories.toFixed(0)} kcal</span>
                                    <span className="text-red-400">{alt.protein.toFixed(0)}g P</span>
                                    <span className="text-yellow-400">{alt.carbs.toFixed(0)}g C</span>
                                    <span className="text-green-400">{alt.fat.toFixed(0)}g F</span>
                                </div>
                            </button>
                        )) : <p className="text-center text-gray-500 py-8">No se encontraron alternativas.</p>}
                    </div>
                )}
                <Button onClick={onClose} variant="secondary" className="w-full mt-6">Cancelar</Button>
            </div>
        </div>
    );
};

const ShoppingListModal: React.FC<{ plan: GeneratedMeal[], onClose: () => void }> = ({ plan, onClose }) => {
    const shoppingList = useMemo(() => {
        const allIngredients = plan.flatMap(meal => meal.ingredients);
        return [...new Set(allIngredients)]; // Simple unique list
    }, [plan]);

    return (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-brand-dark p-6 rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
                <h4 className="text-xl font-bold text-brand-primary mb-4">Lista de la Compra para Hoy</h4>
                 <div className="space-y-3 max-h-80 overflow-y-auto bg-gray-800/50 p-4 rounded-lg">
                    {shoppingList.map((item, index) => (
                        <label key={index} className="flex items-center text-gray-300">
                            <input type="checkbox" className="form-checkbox h-5 w-5 rounded bg-gray-800 text-brand-primary focus:ring-brand-primary border-gray-600 mr-3" />
                            {item}
                        </label>
                    ))}
                </div>
                 <Button onClick={onClose} className="w-full mt-6">Cerrar</Button>
            </div>
        </div>
    )
};

const WeeklyAnalysis: React.FC = () => {
    const { activeUser: user, updateUser } = useUser();
    const [analysis, setAnalysis] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    useEffect(() => {
        if (!user) return;

        const today = new Date();
        const oneWeekAgo = new Date(today);
        oneWeekAgo.setDate(today.getDate() - 7);

        const recentLogs = user.nutritionLog.filter(log => new Date(log.date) >= oneWeekAgo);
        const recentWeights = user.weightHistory.filter(entry => new Date(entry.date) >= oneWeekAgo);

        if (recentLogs.length === 0 || recentWeights.length < 2) {
            setAnalysis({ ready: false, message: 'Necesitas al menos 2 registros de peso y 1 de comida en la última semana para el análisis.' });
            setIsLoading(false);
            return;
        }

        const targets = calculateMacros(user.profile);
        const dailyAdherence = recentLogs.map(log => {
            const totals = log.meals.reduce((acc, meal) => ({
                calories: acc.calories + meal.calories,
                protein: acc.protein + meal.protein,
            }), { calories: 0, protein: 0 });
            return {
                date: new Date(log.date).toLocaleDateString('es-ES', { weekday: 'short' }),
                calories: totals.calories,
                adherence: (totals.calories / targets.calories) * 100,
            };
        });

        const avgWeight = recentWeights.reduce((sum, entry) => sum + entry.weight, 0) / recentWeights.length;
        const weightTrend = recentWeights[recentWeights.length - 1].weight - recentWeights[0].weight;
        
        let suggestion = '';
        let adjustment = 0;
        const goal = user.profile.goal;

        if (goal === Goal.MUSCLE_GAIN_MINIMIZE_FAT) {
            if (weightTrend < 0.1) { // Not gaining
                suggestion = `Tu peso está estancado. Para seguir construyendo músculo, te sugerimos un aumento de 250 kcal.`;
                adjustment = 250;
            } else if (weightTrend > 0.5) { // Gaining too fast
                 suggestion = `Estás ganando peso rápidamente, lo que podría incluir grasa. Te sugerimos una reducción de 150 kcal.`;
                 adjustment = -150;
            } else {
                 suggestion = `¡Gran progreso! Tu ganancia de peso es ideal. Mantén tus calorías actuales.`;
                 adjustment = 0;
            }
        } else if (goal === Goal.FAT_LOSS_PRESERVE_MUSCLE) {
             if (weightTrend > -0.2) { // Not losing
                suggestion = `Tu peso no está bajando como se esperaba. Para impulsar la pérdida de grasa, te sugerimos un recorte de 250 kcal.`;
                adjustment = -250;
            } else if (weightTrend < -0.7) { // Losing too fast
                 suggestion = `Estás perdiendo peso muy rápido, lo que podría afectar tu masa muscular. Te sugerimos un aumento de 150 kcal.`;
                 adjustment = 150;
            } else {
                 suggestion = `¡Excelente! Tu ritmo de pérdida de peso es sostenible y efectivo. Mantén tus calorías.`;
                 adjustment = 0;
            }
        } else {
            suggestion = 'Tu peso se mantiene estable, ¡en línea con tu objetivo de mantenimiento!';
            adjustment = 0;
        }

        setAnalysis({
            ready: true,
            adherenceData: dailyAdherence,
            weightTrend: weightTrend.toFixed(2),
            suggestion,
            adjustment,
        });
        setIsLoading(false);
    }, [user]);

    const handleUpdateMacros = () => {
        if (!user || !analysis || analysis.adjustment === 0) return;
        setIsUpdating(true);
        const updatedProfile = {
            ...user.profile,
            calorieAdjustment: (user.profile.calorieAdjustment || 0) + analysis.adjustment,
        };
        const updatedUser = {
            ...user,
            profile: updatedProfile,
            lastCheckinDate: new Date().toISOString(),
        };
        updateUser(updatedUser);
        alert(`¡Macros actualizados! Tu nuevo ajuste es de ${updatedProfile.calorieAdjustment} kcal.`);
        setIsUpdating(false);
        // Force re-analysis with new data
        setAnalysis(null);
        setIsLoading(true);
    };

    const handleGenerateSummary = async () => {
        if (!user || !analysis) return;
        setIsGeneratingSummary(true);
        try {
            const summary = await getWeeklyNutritionAnalysis(user.profile, user.nutritionLog, user.weightHistory);
            setAiSummary(summary);
        } catch(e) {
            console.error(e);
            setAiSummary("Hubo un error al generar el resumen. Inténtalo de nuevo.");
        } finally {
            setIsGeneratingSummary(false);
        }
    };


    if (isLoading) return <p className="text-center">Analizando datos de la semana...</p>;
    if (!analysis.ready) return <Card><p className="text-center text-gray-400">{analysis.message}</p></Card>;

    return (
        <div className="space-y-6">
             <Card>
                <h2 className="text-xl font-semibold text-brand-secondary mb-4">Adherencia Calórica Semanal (%)</h2>
                <div style={{ width: '100%', height: 200 }}>
                    <ResponsiveContainer>
                        <BarChart data={analysis.adherenceData}>
                            <XAxis dataKey="date" stroke="#A0AEC0" fontSize={12} />
                            <YAxis stroke="#A0AEC0" domain={[0, 150]} unit="%" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#1A202C' }} />
                            <Bar dataKey="adherence" name="Adherencia" fill="#00A9FF" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

             <Card>
                <h2 className="text-xl font-semibold text-brand-secondary mb-4">Ajuste Inteligente</h2>
                <p className="text-gray-300 mb-2">En la última semana, tu peso ha variado en <span className={`font-bold ${analysis.weightTrend > 0 ? 'text-yellow-400' : 'text-green-400'}`}>{analysis.weightTrend} kg</span>.</p>
                <p className="text-brand-light mb-4">{analysis.suggestion}</p>
                {analysis.adjustment !== 0 && (
                     <Button onClick={handleUpdateMacros} disabled={isUpdating}>
                        {isUpdating ? 'Actualizando...' : `Aceptar y ajustar ${analysis.adjustment} kcal`}
                    </Button>
                )}
            </Card>

            <Card>
                <h2 className="text-xl font-semibold text-brand-secondary mb-4">Resumen de IA</h2>
                {aiSummary ? (
                    <p className="text-gray-300 whitespace-pre-wrap">{aiSummary}</p>
                ) : (
                    <>
                        <p className="text-gray-400 mb-4">Obtén un resumen personalizado de tu semana y consejos para la próxima.</p>
                        <Button onClick={handleGenerateSummary} disabled={isGeneratingSummary} variant="secondary">
                            {isGeneratingSummary ? 'Analizando...' : 'Obtener Resumen de IA'}
                        </Button>
                    </>
                )}
            </Card>
        </div>
    );
};


// --- Main Page Component ---
const Nutrition: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
    const { activeUser: user, updateUser } = useUser();

    // Reset daily plan when a new day starts
    useEffect(() => {
        if (user) {
            const today = new Date().toISOString().split('T')[0];
            const lastLogDate = user.nutritionLog.length > 0 ? new Date(user.nutritionLog[user.nutritionLog.length - 1].date).toISOString().split('T')[0] : null;
            
            if (lastLogDate && today !== lastLogDate && user.dailyDietPlan) {
                // It's a new day, clear the old plan
                updateUser({ ...user, dailyDietPlan: null });
            }
        }
    }, [user, updateUser]);

    const isCheckinAvailable = useMemo(() => {
        if (!user || !user.lastCheckinDate) return true;
        const lastCheckin = new Date(user.lastCheckinDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastCheckin.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 7;
    }, [user]);

    return (
        <div>
            <div className="flex border-b border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('daily')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === 'daily' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}
                >
                    Resumen Diario
                </button>
                 <button
                    onClick={() => setActiveTab('weekly')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors relative ${activeTab === 'weekly' ? 'text-brand-primary border-b-2 border-brand-primary' : 'text-gray-400'}`}
                >
                    Análisis Semanal
                    {isCheckinAvailable && <span className="absolute top-1 right-1 w-3 h-3 bg-brand-primary rounded-full animate-pulse"></span>}
                </button>
            </div>
            {activeTab === 'daily' ? <DailySummary /> : <WeeklyAnalysis />}
        </div>
    );
};

export default Nutrition;
