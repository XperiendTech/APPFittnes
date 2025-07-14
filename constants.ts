import { Goal } from './types';

export const APP_NAME = "Hypertik";

export const MACRO_CONFIG = {
  [Goal.MUSCLE_GAIN_MINIMIZE_FAT]: {
    proteinPerKg: 1.8,
    fatPerKg: 1.0,
    calorieSurplus: 300,
  },
  [Goal.FAT_LOSS_PRESERVE_MUSCLE]: {
    proteinPerKg: 2.0,
    fatPerKg: 0.8,
    calorieDeficit: -400,
  },
   [Goal.BODY_RECOMPOSITION]: {
    proteinPerKg: 2.0,
    fatPerKg: 0.9,
    calorieDeficit: -150,
  },
  [Goal.MAINTENANCE]: {
    proteinPerKg: 1.6,
    fatPerKg: 0.9,
    calorieSurplus: 0,
  },
};

export const ACTIVITY_MULTIPLIER = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};