

export enum Goal {
  MUSCLE_GAIN_MINIMIZE_FAT = 'Ganar músculo minimizando grasa',
  FAT_LOSS_PRESERVE_MUSCLE = 'Perder grasa preservando músculo',
  BODY_RECOMPOSITION = 'Recomposición corporal',
  MAINTENANCE = 'Mantenimiento',
}

export enum ExperienceLevel {
  BEGINNER = 'Principiante',
  INTERMEDIATE = 'Intermedio',
  ADVANCED = 'Avanzado',
}

export enum Gender {
  MALE = 'Masculino',
  FEMALE = 'Femenino',
}

export enum Somatotype {
    ECTOMORPH = 'Ectomorfo',
    MESOMORPH = 'Mesomorfo',
    ENDOMORPH = 'Endomorfo',
}

export enum DietType {
    OMNIVORE = 'Omnívora',
    VEGETARIAN = 'Vegetariana',
    VEGAN = 'Vegana',
    KETO = 'Cetogénica',
    CUSTOM = 'Personalizada',
}

export enum Equipment {
    BARBELL = 'Barra',
    DUMBBELL = 'Mancuerna',
    MACHINE = 'Máquina',
    BODYWEIGHT = 'Peso Corporal',
    KETTLEBELL = 'Kettlebell',
    CABLE = 'Cable',
}

export enum TrainingStyle {
    HYPERTROPHY = 'Hipertrofia',
    STRENGTH = 'Fuerza',
    POWERBUILDING = 'Powerbuilding',
    BODYBUILDING = 'Bodybuilding',
    CALISTHENICS = 'Calistenia',
}


export interface UserProfile {
  name: string;
  gender: Gender;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  bodyFat: number; // in %
  goal: Goal;
  experience: ExperienceLevel;
  trainingDays: number;
  somatotype: Somatotype;
  trainingStyle: TrainingStyle;
  injuries: string;
  dietType: DietType;
  preferredFoods: string;
  avoidedFoods: string;
  // New fields for smart nutrition
  wakeUpTime: string; // e.g., "07:00"
  trainingTime: string; // e.g., "18:00"
  sleepTime: string; // e.g., "23:00"
  calorieAdjustment: number; // e.g., 250 or -250
  proteinSupplementName?: string;
  carbSupplementName?: string;
}

export interface BodyMeasurement {
    date: string; // ISO string
    arm?: number; // in cm
    waist?: number; // in cm
    leg?: number; // in cm
    neck?: number; // in cm
    bodyFat?: number; // in %
}

export interface User {
  id: string; // Unique identifier for each user profile
  profile: UserProfile;
  workoutLog: WorkoutLog[];
  nutritionLog: NutritionLog[];
  weightHistory: WeightEntry[];
  bodyMeasurements: BodyMeasurement[];
  weeklyWorkoutPlan: WorkoutPlan[] | null;
  dailyDietPlan: GeneratedMeal[] | null;
  lastCheckinDate?: string; // ISO string
  lastUsed?: string; // ISO string for last access
  pinned?: boolean; // To keep profile on top
}

export interface WorkoutSet {
    reps: number;
    weight: number;
    rpe: number; // Rate of Perceived Exertion
}

export interface WorkoutLog {
  date: string; // ISO string
  exercise: string;
  sets: WorkoutSet[];
  muscleGroup: string;
}

export interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// NUEVA INTERFAZ
export interface GeneratedMeal extends Meal {
    id: string;
    ingredients: string[];
    completed: boolean;
    type: 'meal' | 'supplement';
}


export interface NutritionLog {
  date: string; // ISO string
  meals: Meal[];
}

export interface WeightEntry {
  date: string; // ISO string
  weight: number; // in kg
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  description: string;
  videoUrl?: string;
  type: 'multi-joint' | 'isolation';
  level: ExperienceLevel;
  equipment: Equipment;
}

export interface WorkoutPlan {
  id: string; // e.g. "push_a"
  name: string; // "Empuje A"
  muscleGroups: string[]; // e.g. ["Pecho", "Hombros", "Tríceps"]
  exercises: {
    exercise: Exercise;
    sets: number;
    reps: string;
    rest: number; // in seconds
  }[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface AIInsight {
  type: 'warning' | 'info' | 'success';
  title: string;
  message: string;
  tip?: string;
}