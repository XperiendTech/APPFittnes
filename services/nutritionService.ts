import { UserProfile, Gender, Goal } from '../types';
import { MACRO_CONFIG, ACTIVITY_MULTIPLIER } from '../constants';

// Using Mifflin-St Jeor Equation for BMR
export const calculateBMR = (profile: UserProfile): number => {
    const { gender, weight, height, age } = profile;
    if (gender === Gender.MALE) {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
        return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
};

export const calculateTDEE = (profile: UserProfile): number => {
    const bmr = calculateBMR(profile);
    // Assuming 'moderate' activity level for simplicity. This could be a profile setting.
    return bmr * ACTIVITY_MULTIPLIER.moderate;
};

export const calculateMacros = (profile: UserProfile): { calories: number; protein: number; carbs: number; fat: number } => {
    const tdee = calculateTDEE(profile);
    const { goal, weight, calorieAdjustment } = profile;
    const config = MACRO_CONFIG[goal];

    let targetCalories = tdee;
    if ('calorieSurplus' in config && config.calorieSurplus !== undefined) {
        targetCalories += config.calorieSurplus;
    } else if ('calorieDeficit' in config && config.calorieDeficit !== undefined) {
        targetCalories += config.calorieDeficit;
    }

    // Apply the smart weekly adjustment
    targetCalories += (calorieAdjustment || 0);
    
    const protein = weight * config.proteinPerKg;
    const fat = weight * config.fatPerKg;

    const proteinCalories = protein * 4;
    const fatCalories = fat * 9;

    const carbCalories = targetCalories - proteinCalories - fatCalories;
    const carbs = carbCalories / 4;

    return {
        calories: targetCalories,
        protein,
        carbs: carbs > 0 ? carbs : 0,
        fat,
    };
};

// Using Deurenberg formula for body fat % estimation
export const estimateBodyFatPercentage = (profile: { weight: number; height: number; age: number; gender: Gender }): number => {
    const { weight, height, age, gender } = profile;
    if (!weight || !height || !age || !gender) {
        return 15; // Return a default average if data is missing
    }

    const bmi = weight / ((height / 100) ** 2);
    const genderFactor = gender === Gender.MALE ? 1 : 0;

    const bodyFat = (1.20 * bmi) + (0.23 * age) - (10.8 * genderFactor) - 5.4;
    
    // Clamp the value to a reasonable range
    return Math.round(Math.max(5, Math.min(50, bodyFat)));
};
