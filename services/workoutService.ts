

import { UserProfile, WorkoutPlan, Exercise, ExperienceLevel, Equipment, TrainingStyle } from '../types';

export const exerciseLibrary: Exercise[] = [
    // Pecho
    { id: 'press_banca', name: 'Press de Banca con Barra', muscleGroup: 'Pecho', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.BARBELL, description: 'Ejercicio compuesto para el pectoral, hombros y tríceps.', videoUrl: 'https://i.imgur.com/r69vB2s.gif' },
    { id: 'press_inclinado_mancuerna', name: 'Press Inclinado con Mancuerna', muscleGroup: 'Pecho', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.DUMBBELL, description: 'Variante para enfocar la parte superior del pectoral.', videoUrl: 'https://i.imgur.com/1g8g1e3.gif'},
    { id: 'aperturas_mancuernas', name: 'Aperturas con Mancuernas', muscleGroup: 'Pecho', type: 'isolation', level: ExperienceLevel.BEGINNER, equipment: Equipment.DUMBBELL, description: 'Ejercicio de aislamiento para el pectoral.', videoUrl: 'https://i.imgur.com/sS5g2ez.gif' },
    { id: 'fondos_pecho', name: 'Fondos para Pecho', muscleGroup: 'Pecho', type: 'multi-joint', level: ExperienceLevel.ADVANCED, equipment: Equipment.BODYWEIGHT, description: 'Ejercicio de peso corporal que trabaja pectoral, hombros y tríceps.', videoUrl: 'https://i.imgur.com/7g4g3fE.gif'},
    { id: 'flexiones', name: 'Flexiones', muscleGroup: 'Pecho', type: 'multi-joint', level: ExperienceLevel.BEGINNER, equipment: Equipment.BODYWEIGHT, description: 'Ejercicio fundamental de peso corporal para el pecho.'},
    { id: 'cruce_poleas', name: 'Cruce de Poleas', muscleGroup: 'Pecho', type: 'isolation', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.CABLE, description: 'Aislamiento para la parte interna del pectoral.' },
    { id: 'press_banca_mancuernas', name: 'Press de Banca con Mancuernas', muscleGroup: 'Pecho', type: 'multi-joint', level: ExperienceLevel.BEGINNER, equipment: Equipment.DUMBBELL, description: 'Alternativa con mancuernas al press de banca, permite mayor rango de movimiento.' },


    // Piernas (Cuádriceps, Glúteos)
    { id: 'sentadillas', name: 'Sentadilla con Barra', muscleGroup: 'Piernas', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.BARBELL, description: 'Ejercicio fundamental para el tren inferior.', videoUrl: 'https://i.imgur.com/v58y2XT.gif' },
    { id: 'sentadilla_corporal', name: 'Sentadilla con Peso Corporal', muscleGroup: 'Piernas', type: 'multi-joint', level: ExperienceLevel.BEGINNER, equipment: Equipment.BODYWEIGHT, description: 'Ejercicio fundamental de peso corporal para el tren inferior.'},
    { id: 'prensa_piernas', name: 'Prensa de Piernas', muscleGroup: 'Piernas', type: 'multi-joint', level: ExperienceLevel.BEGINNER, equipment: Equipment.MACHINE, description: 'Alternativa a la sentadilla, enfocada en cuádriceps y glúteos.', videoUrl: 'https://i.imgur.com/YQ8g0nS.gif' },
    { id: 'zancadas_mancuernas', name: 'Zancadas con Mancuernas', muscleGroup: 'Piernas', type: 'multi-joint', level: ExperienceLevel.BEGINNER, equipment: Equipment.DUMBBELL, description: 'Ejercicio unilateral para piernas y glúteos.', videoUrl: 'https://i.imgur.com/3qg3g1d.gif'},
    { id: 'extensiones_cuadriceps', name: 'Extensiones de Cuádriceps', muscleGroup: 'Piernas', type: 'isolation', level: ExperienceLevel.BEGINNER, equipment: Equipment.MACHINE, description: 'Ejercicio de aislamiento para los cuádriceps.', videoUrl: 'https://i.imgur.com/sS5fE2z.gif' },
    { id: 'sentadilla_goblet', name: 'Sentadilla Goblet', muscleGroup: 'Piernas', type: 'multi-joint', level: ExperienceLevel.BEGINNER, equipment: Equipment.KETTLEBELL, description: 'Variante de sentadilla más amigable para principiantes.' },
    { id: 'sentadilla_bulgara', name: 'Sentadilla Búlgara', muscleGroup: 'Piernas', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.DUMBBELL, description: 'Ejercicio unilateral avanzado para cuádriceps y glúteos.'},
    { id: 'hip_thrust', name: 'Hip Thrust con Barra', muscleGroup: 'Piernas', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.BARBELL, description: 'Ejercicio principal para el desarrollo de los glúteos.'},
    { id: 'sentadilla_pistol_asistida', name: 'Sentadilla Pistol (Asistida)', muscleGroup: 'Piernas', type: 'multi-joint', level: ExperienceLevel.ADVANCED, equipment: Equipment.BODYWEIGHT, description: 'Versión unilateral de la sentadilla, un gran constructor de fuerza y equilibrio en las piernas.' },


    // Isquiotibiales
    { id: 'curl_femoral_tumbado', name: 'Curl Femoral Tumbado', muscleGroup: 'Isquiotibiales', type: 'isolation', level: ExperienceLevel.BEGINNER, equipment: Equipment.MACHINE, description: 'Ejercicio de aislamiento para los isquiotibiales.', videoUrl: 'https://i.imgur.com/tY3B3g1.gif' },
    { id: 'peso_muerto_rumano', name: 'Peso Muerto Rumano con Barra', muscleGroup: 'Isquiotibiales', type: 'multi-joint', level: ExperienceLevel.ADVANCED, equipment: Equipment.BARBELL, description: 'Ejercicio enfocado en isquiotibiales y glúteos.', videoUrl: 'https://i.imgur.com/j3g2g1d.gif'},
    { id: 'peso_muerto_rumano_mancuerna', name: 'Peso Muerto Rumano con Mancuernas', muscleGroup: 'Isquiotibiales', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.DUMBBELL, description: 'Variante con mancuernas del peso muerto rumano.'},
    { id: 'puente_gluteos', name: 'Puente de Glúteos', muscleGroup: 'Isquiotibiales', type: 'isolation', level: ExperienceLevel.BEGINNER, equipment: Equipment.BODYWEIGHT, description: 'Ejercicio para activar y fortalecer los glúteos e isquiotibiales.' },

    // Espalda
    { id: 'peso_muerto_convencional', name: 'Peso Muerto Convencional', muscleGroup: 'Espalda', type: 'multi-joint', level: ExperienceLevel.ADVANCED, equipment: Equipment.BARBELL, description: 'Ejercicio de cuerpo completo que fortalece la cadena posterior.', videoUrl: 'https://i.imgur.com/w2C3aQG.gif' },
    { id: 'dominadas', name: 'Dominadas', muscleGroup: 'Espalda', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.BODYWEIGHT, description: 'Ejercicio de tracción para la espalda y bíceps.', videoUrl: 'https://i.imgur.com/V70g430.gif' },
    { id: 'remo_barra', name: 'Remo con Barra', muscleGroup: 'Espalda', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.BARBELL, description: 'Ejercicio de tracción horizontal para la espalda.', videoUrl: 'https://i.imgur.com/8QlH1h2.gif' },
    { id: 'jalon_al_pecho', name: 'Jalón al Pecho', muscleGroup: 'Espalda', type: 'multi-joint', level: ExperienceLevel.BEGINNER, equipment: Equipment.MACHINE, description: 'Alternativa a las dominadas para trabajar el dorsal ancho.', videoUrl: 'https://i.imgur.com/uG9g9e1.gif'},
    { id: 'remo_sentado_polea', name: 'Remo Sentado en Polea', muscleGroup: 'Espalda', type: 'multi-joint', level: ExperienceLevel.BEGINNER, equipment: Equipment.CABLE, description: 'Tracción horizontal controlada para la espalda media.'},
    { id: 'remo_con_mancuerna', name: 'Remo con Mancuerna', muscleGroup: 'Espalda', type: 'multi-joint', level: ExperienceLevel.BEGINNER, equipment: Equipment.DUMBBELL, description: 'Ejercicio de remo unilateral para aislar cada lado de la espalda.'},
    { id: 'face_pull', name: 'Face Pull', muscleGroup: 'Hombros', type: 'isolation', level: ExperienceLevel.BEGINNER, equipment: Equipment.CABLE, description: 'Excelente para la salud del hombro y deltoides posterior.'},
    { id: 'remo_invertido', name: 'Remo Invertido', muscleGroup: 'Espalda', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.BODYWEIGHT, description: 'Excelente ejercicio de peso corporal para la espalda y bíceps, alternativa al remo con barra.'},
    
    // Hombros
    { id: 'press_militar_barra', name: 'Press Militar con Barra', muscleGroup: 'Hombros', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.BARBELL, description: 'Ejercicio de empuje vertical para hombros.', videoUrl: 'https://i.imgur.com/Y2s5CPA.gif' },
    { id: 'press_hombro_mancuerna', name: 'Press de Hombro con Mancuernas', muscleGroup: 'Hombros', type: 'multi-joint', level: ExperienceLevel.BEGINNER, equipment: Equipment.DUMBBELL, description: 'Alternativa con mancuernas para el press de hombros.'},
    { id: 'elevaciones_laterales_mancuerna', name: 'Elevaciones Laterales con Mancuernas', muscleGroup: 'Hombros', type: 'isolation', level: ExperienceLevel.BEGINNER, equipment: Equipment.DUMBBELL, description: 'Ejercicio de aislamiento para el deltoides medial.', videoUrl: 'https://i.imgur.com/6M1Z2mD.gif' },
    { id: 'press_arnold', name: 'Press Arnold', muscleGroup: 'Hombros', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.DUMBBELL, description: 'Variante de press de hombro que trabaja las 3 cabezas.'},
    { id: 'pike_pushup', name: 'Pike Push-up', muscleGroup: 'Hombros', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.BODYWEIGHT, description: 'Flexión avanzada que enfoca los hombros, precursora del handstand push-up.' },
    
    // Bíceps
    { id: 'curl_biceps_barra', name: 'Curl de Bíceps con Barra', muscleGroup: 'Bíceps', type: 'isolation', level: ExperienceLevel.BEGINNER, equipment: Equipment.BARBELL, description: 'Ejercicio de aislamiento para los bíceps.', videoUrl: 'https://i.imgur.com/4S0t2uR.gif' },
    { id: 'curl_martillo', name: 'Curl Martillo con Mancuernas', muscleGroup: 'Bíceps', type: 'isolation', level: ExperienceLevel.BEGINNER, equipment: Equipment.DUMBBELL, description: 'Enfatiza el braquial y el antebrazo.'},
    { id: 'curl_alterno_mancuerna', name: 'Curl Alterno con Mancuernas', muscleGroup: 'Bíceps', type: 'isolation', level: ExperienceLevel.BEGINNER, equipment: Equipment.DUMBBELL, description: 'Curl de bíceps clásico, alternando brazos.'},

    // Tríceps
    { id: 'extensiones_triceps_polea', name: 'Extensiones de Tríceps en Polea', muscleGroup: 'Tríceps', type: 'isolation', level: ExperienceLevel.BEGINNER, equipment: Equipment.CABLE, description: 'Ejercicio de aislamiento para los tríceps.', videoUrl: 'https://i.imgur.com/8Q8D5gE.gif' },
    { id: 'press_frances', name: 'Press Francés', muscleGroup: 'Tríceps', type: 'isolation', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.BARBELL, description: 'Ejercicio de aislamiento para tríceps acostado.', videoUrl: 'https://i.imgur.com/5S5fE2z.gif' },
    { id: 'press_cerrado', name: 'Press de Banca Cerrado', muscleGroup: 'Tríceps', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.BARBELL, description: 'Variante del press de banca que enfatiza los tríceps.'},
    { id: 'flexiones_diamante', name: 'Flexiones Diamante', muscleGroup: 'Tríceps', type: 'multi-joint', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.BODYWEIGHT, description: 'Variante de flexión con manos juntas para un mayor énfasis en los tríceps.' },

    // Abdominales
    { id: 'elevacion_piernas_colgado', name: 'Elevación de Piernas Colgado', muscleGroup: 'Abdominales', type: 'isolation', level: ExperienceLevel.INTERMEDIATE, equipment: Equipment.BODYWEIGHT, description: 'Ejercicio avanzado para el recto abdominal y flexores de cadera.'},
    { id: 'plancha_abdominal', name: 'Plancha Abdominal', muscleGroup: 'Abdominales', type: 'isolation', level: ExperienceLevel.BEGINNER, equipment: Equipment.BODYWEIGHT, description: 'Ejercicio isométrico fundamental para la fuerza del core.'},
    { id: 'crunch_abdominal', name: 'Crunch Abdominal', muscleGroup: 'Abdominales', type: 'isolation', level: ExperienceLevel.BEGINNER, equipment: Equipment.BODYWEIGHT, description: 'Ejercicio clásico para trabajar la parte superior del abdomen.'},
];


export const getExercises = (filters: { muscleGroup?: string, level?: ExperienceLevel, equipment?: Equipment }): Exercise[] => {
    return exerciseLibrary.filter(ex => {
        return (!filters.muscleGroup || ex.muscleGroup === filters.muscleGroup) &&
               (!filters.level || ex.level === filters.level) &&
               (!filters.equipment || ex.equipment === filters.equipment);
    });
};

export const getExerciseById = (id: string): Exercise | undefined => {
    return exerciseLibrary.find(ex => ex.id === id);
};
export const getExerciseByName = (name: string): Exercise | undefined => {
    return exerciseLibrary.find(ex => ex.name.toLowerCase() === name.toLowerCase());
};

const getExercisesForRoutine = (
    muscleGroups: string[], 
    type: 'multi-joint' | 'isolation', 
    count: number, 
    level: ExperienceLevel, 
    excludeIds: string[] = [], 
    availableEquipment: Equipment[] | null,
    isPowerLift: boolean = false
): Exercise[] => {
    const candidates = exerciseLibrary.filter(ex => 
        muscleGroups.some(mg => ex.muscleGroup.includes(mg)) && 
        ex.type === type &&
        !excludeIds.includes(ex.id) &&
        (!availableEquipment || availableEquipment.includes(ex.equipment))
    );
    
    if (isPowerLift) {
        // Prioritize the main barbell lifts for powerlifting
        const powerLifts = ['press_banca', 'sentadillas', 'peso_muerto_convencional', 'press_militar_barra'];
        const powerCandidates = candidates.filter(ex => powerLifts.includes(ex.id));
        if(powerCandidates.length > 0) return powerCandidates.slice(0, count);
    }
    
    candidates.sort((a, b) => {
        const aLevelMatch = a.level === level ? 0 : 1;
        const bLevelMatch = b.level === level ? 0 : 1;
        return aLevelMatch - bLevelMatch;
    });

    return candidates.sort(() => 0.5 - Math.random()).slice(0, count);
};


const createWorkoutFromTemplate = (
    id: string,
    name: string,
    template: { groups: string[]; type: 'multi-joint' | 'isolation'; count: number, isPowerLift?: boolean }[],
    profile: UserProfile,
    config: any,
    availableEquipment: Equipment[] | null,
    excludeIds: string[] = []
): { plan: WorkoutPlan; usedIds: string[] } => {
    let exercises: { exercise: Exercise; sets: number; reps: string; rest: number }[] = [];
    let usedIdsInWorkout: string[] = [...excludeIds];
    
    template.forEach(item => {
        const newExercises = getExercisesForRoutine(item.groups, item.type, item.count, profile.experience, usedIdsInWorkout, availableEquipment, item.isPowerLift);
        newExercises.forEach(ex => {
            let sets, reps, rest;
            if (item.isPowerLift && config.powerSets) {
                sets = config.powerSets;
                reps = config.powerReps;
                rest = config.restPower;
            } else {
                sets = ex.type === 'multi-joint' ? config.compSets : config.isoSets;
                reps = ex.type === 'multi-joint' ? config.compReps : config.isoReps;
                rest = ex.type === 'multi-joint' ? config.restComp : config.restIso;
            }

            exercises.push({
                exercise: ex,
                sets,
                reps,
                rest,
            });
            usedIdsInWorkout.push(ex.id);
        });
    });

    const plan: WorkoutPlan = {
        id,
        name,
        muscleGroups: [...new Set(template.flatMap(t => t.groups))],
        exercises,
    };

    return { plan, usedIds: usedIdsInWorkout };
};

export const generateFullWeeklyPlan = (profile: UserProfile): WorkoutPlan[] => {
    const { experience, trainingDays, trainingStyle } = profile;
    
    const equipmentFilter = trainingStyle === TrainingStyle.CALISTHENICS ? [Equipment.BODYWEIGHT] : null;

    const styleConfigs = {
        [TrainingStyle.HYPERTROPHY]: { compSets: 3, isoSets: 3, compReps: '8-12', isoReps: '10-15', restComp: 120, restIso: 90 },
        [TrainingStyle.STRENGTH]: { powerSets: 5, powerReps: '3-5', compSets: 3, compReps: '6-8', restPower: 240, restComp: 180, isoSets: 0, isoReps: '', restIso: 0 },
        [TrainingStyle.POWERBUILDING]: { powerSets: 4, powerReps: '4-6', compSets: 3, isoSets: 3, compReps: '8-12', isoReps: '10-15', restPower: 180, restComp: 120, restIso: 90 },
        [TrainingStyle.BODYBUILDING]: { compSets: 4, isoSets: 4, compReps: '8-15', isoReps: '12-20', restComp: 90, restIso: 60 },
        [TrainingStyle.CALISTHENICS]: { compSets: 4, isoSets: 3, compReps: '5-20', isoReps: '10-25', restComp: 120, restIso: 75 },
    };

    const hypertrophyAndBodybuildingTemplates = {
        push: [ { groups: ['Pecho'], type: 'multi-joint', count: 2 }, { groups: ['Hombros'], type: 'multi-joint', count: 1 }, { groups: ['Tríceps'], type: 'isolation', count: 2 } ],
        pull: [ { groups: ['Espalda'], type: 'multi-joint', count: 2 }, { groups: ['Hombros'], type: 'isolation', count: 1 }, { groups: ['Bíceps'], type: 'isolation', count: 2 } ],
        legs: [ { groups: ['Piernas'], type: 'multi-joint', count: 2 }, { groups: ['Isquiotibiales'], type: 'multi-joint', count: 1 }, { groups: ['Piernas'], type: 'isolation', count: 1 }, { groups: ['Abdominales'], type: 'isolation', count: 1 } ],
        upper: [ { groups: ['Pecho'], type: 'multi-joint', count: 1 }, { groups: ['Espalda'], type: 'multi-joint', count: 1 }, { groups: ['Hombros'], type: 'multi-joint', count: 1 }, { groups: ['Bíceps'], type: 'isolation', count: 1 }, { groups: ['Tríceps'], type: 'isolation', count: 1 } ],
        lower: [ { groups: ['Piernas'], type: 'multi-joint', count: 2 }, { groups: ['Isquiotibiales'], type: 'multi-joint', count: 1 }, { groups: ['Piernas'], type: 'isolation', count: 1 }, { groups: ['Abdominales'], type: 'isolation', count: 1 } ],
        full_body: [ { groups: ['Piernas'], type: 'multi-joint', count: 1 }, { groups: ['Pecho'], type: 'multi-joint', count: 1 }, { groups: ['Espalda'], type: 'multi-joint', count: 1 }, { groups: ['Hombros'], type: 'isolation', count: 1 }, { groups: ['Bíceps', 'Tríceps'], type: 'isolation', count: 1 } ],
    };

    const strengthTemplates = {
        push: [ { groups: ['Pecho'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Hombros'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Tríceps'], type: 'multi-joint', count: 1 } ],
        pull: [ { groups: ['Espalda'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Espalda'], type: 'multi-joint', count: 1 }, { groups: ['Bíceps'], type: 'isolation', count: 1 } ],
        legs: [ { groups: ['Piernas'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Isquiotibiales'], type: 'multi-joint', count: 1 }, { groups: ['Abdominales'], type: 'isolation', count: 1 } ],
        upper: [ { groups: ['Pecho'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Espalda'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Hombros'], type: 'multi-joint', count: 1 } ],
        lower: [ { groups: ['Piernas'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Isquiotibiales'], type: 'multi-joint', count: 1 }, { groups: ['Abdominales'], type: 'isolation', count: 1 } ],
        full_body: [ { groups: ['Piernas'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Pecho'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Espalda'], type: 'multi-joint', count: 1, isPowerLift: true } ],
    };

    const powerbuildingTemplates = {
        push: [ { groups: ['Pecho'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Hombros'], type: 'multi-joint', count: 1 }, { groups: ['Pecho'], type: 'isolation', count: 1 }, { groups: ['Tríceps'], type: 'isolation', count: 2 } ],
        pull: [ { groups: ['Espalda'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Espalda'], type: 'multi-joint', count: 1 }, { groups: ['Bíceps'], type: 'isolation', count: 2 } ],
        legs: [ { groups: ['Piernas'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Isquiotibiales'], type: 'multi-joint', count: 1 }, { groups: ['Piernas'], type: 'isolation', count: 2 }, { groups: ['Abdominales'], type: 'isolation', count: 1 } ],
        upper: [ { groups: ['Pecho'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Espalda'], type: 'multi-joint', count: 1 }, { groups: ['Hombros', 'Tríceps'], type: 'isolation', count: 1 }, { groups: ['Bíceps'], type: 'isolation', count: 1 } ],
        lower: [ { groups: ['Piernas'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Isquiotibiales'], type: 'multi-joint', count: 1 }, { groups: ['Piernas'], type: 'isolation', count: 1 }, { groups: ['Abdominales'], type: 'isolation', count: 1 } ],
        full_body: [ { groups: ['Piernas'], type: 'multi-joint', count: 1, isPowerLift: true }, { groups: ['Pecho'], type: 'multi-joint', count: 1 }, { groups: ['Espalda'], type: 'multi-joint', count: 1 }, { groups: ['Abdominales'], type: 'isolation', count: 1 } ],
    };

    const calisthenicsTemplates = {
        push: [ { groups: ['Pecho', 'Hombros'], type: 'multi-joint', count: 2 }, { groups: ['Tríceps'], type: 'multi-joint', count: 2 } ],
        pull: [ { groups: ['Espalda'], type: 'multi-joint', count: 3 }, { groups: ['Abdominales'], type: 'isolation', count: 1 } ],
        legs: [ { groups: ['Piernas'], type: 'multi-joint', count: 3 }, { groups: ['Isquiotibiales'], type: 'isolation', count: 1 } ],
        upper: [ { groups: ['Pecho'], type: 'multi-joint', count: 1 }, { groups: ['Espalda'], type: 'multi-joint', count: 1 }, { groups: ['Hombros'], type: 'multi-joint', count: 1 }, { groups: ['Tríceps'], type: 'multi-joint', count: 1 } ],
        lower: [ { groups: ['Piernas'], type: 'multi-joint', count: 2 }, { groups: ['Isquiotibiales'], type: 'isolation', count: 1 }, { groups: ['Abdominales'], type: 'isolation', count: 2 } ],
        full_body: [ { groups: ['Piernas'], type: 'multi-joint', count: 1 }, { groups: ['Pecho'], type: 'multi-joint', count: 1 }, { groups: ['Espalda'], type: 'multi-joint', count: 1 }, { groups: ['Abdominales'], type: 'isolation', count: 1 } ],
    };

    const templates = {
        [TrainingStyle.HYPERTROPHY]: hypertrophyAndBodybuildingTemplates,
        [TrainingStyle.BODYBUILDING]: hypertrophyAndBodybuildingTemplates,
        [TrainingStyle.STRENGTH]: strengthTemplates,
        [TrainingStyle.POWERBUILDING]: powerbuildingTemplates,
        [TrainingStyle.CALISTHENICS]: calisthenicsTemplates,
    };
    
    const config = styleConfigs[trainingStyle] || styleConfigs[TrainingStyle.HYPERTROPHY];
    const currentTemplates = templates[trainingStyle] || templates[TrainingStyle.HYPERTROPHY];

    let routineStructure: { id: string; name: string; template: any[] }[] = [];
    switch (trainingDays) {
        case 2:
            routineStructure = [ { id: 'full_body_a', name: 'Full Body A', template: currentTemplates.full_body }, { id: 'full_body_b', name: 'Full Body B', template: currentTemplates.full_body } ];
            break;
        case 3:
            routineStructure = [ { id: 'push', name: 'Empuje', template: currentTemplates.push }, { id: 'pull', name: 'Tirón', template: currentTemplates.pull }, { id: 'legs', name: 'Pierna', template: currentTemplates.legs } ];
            break;
        case 4:
            routineStructure = [ { id: 'upper_a', name: 'Superior A', template: currentTemplates.upper }, { id: 'lower_a', name: 'Inferior A', template: currentTemplates.lower }, { id: 'upper_b', name: 'Superior B', template: currentTemplates.upper }, { id: 'lower_b', name: 'Inferior B', template: currentTemplates.lower } ];
            break;
        case 5:
            routineStructure = [ { id: 'push_a', name: 'Empuje A', template: currentTemplates.push }, { id: 'pull_a', name: 'Tirón A', template: currentTemplates.pull }, { id: 'legs_a', name: 'Pierna A', template: currentTemplates.legs }, { id: 'upper_b', name: 'Superior', template: currentTemplates.upper }, { id: 'lower_b', 'name': 'Inferior', template: currentTemplates.lower } ];
            break;
        case 6:
        default:
            routineStructure = [ { id: 'push_a', name: 'Empuje A', template: currentTemplates.push }, { id: 'pull_a', name: 'Tirón A', template: currentTemplates.pull }, { id: 'legs_a', name: 'Pierna A', template: currentTemplates.legs }, { id: 'push_b', name: 'Empuje B', template: currentTemplates.push }, { id: 'pull_b', name: 'Tirón B', template: currentTemplates.pull }, { id: 'legs_b', name: 'Pierna B', template: currentTemplates.legs } ];
            break;
    }

    const weeklyPlan: WorkoutPlan[] = [];
    let allUsedIds: string[] = [];
    routineStructure.forEach(routine => {
        const { plan, usedIds } = createWorkoutFromTemplate(routine.id, routine.name, routine.template, profile, config, equipmentFilter, allUsedIds);
        weeklyPlan.push(plan);
        allUsedIds = [...new Set([...allUsedIds, ...usedIds])];
    });

    return weeklyPlan;
};