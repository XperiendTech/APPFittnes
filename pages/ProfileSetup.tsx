import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { UserProfile, Goal, ExperienceLevel, Gender, Somatotype, DietType, TrainingStyle } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { estimateBodyFatPercentage } from '../services/nutritionService';

type FormValues = Omit<UserProfile, 'weightHistory' | 'calorieAdjustment'>;

const ProfileSetup: React.FC = () => {
  const { saveUserProfile, users } = useUser();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({mode: 'onBlur'});
  const [step, setStep] = useState(1);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const numericData = {
        age: Number(data.age),
        weight: Number(data.weight),
        height: Number(data.height),
        trainingDays: Number(data.trainingDays),
    };

    let finalBodyFat = data.bodyFat ? Number(data.bodyFat) : 0;
    
    if (!finalBodyFat) {
        finalBodyFat = estimateBodyFatPercentage({
            weight: numericData.weight,
            height: numericData.height,
            age: numericData.age,
            gender: data.gender,
        });
    }

    const profile: UserProfile = {
      ...data,
      ...numericData,
      bodyFat: finalBodyFat,
      calorieAdjustment: 0,
    };
    saveUserProfile(profile);
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-brand-primary mb-2">Bienvenido a Hypertik</h1>
        <p className="text-center text-brand-light mb-6">Completemos tu perfil para empezar.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold text-brand-secondary">Paso 1: Tu Físico</h2>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Nombre</label>
                <input {...register('name', { required: 'El nombre es obligatorio' })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">Género</label>
                  <select {...register('gender', { required: true })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary">
                    <option value={Gender.MALE}>Masculino</option>
                    <option value={Gender.FEMALE}>Femenino</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">Edad</label>
                  <input type="number" {...register('age', { required: 'La edad es obligatoria', min: 12, max: 100 })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                   {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">Peso (kg)</label>
                  <input type="number" step="0.1" {...register('weight', { required: 'El peso es obligatorio' })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                   {errors.weight && <p className="text-red-400 text-sm mt-1">{errors.weight.message}</p>}
                </div>
                 <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">Altura (cm)</label>
                  <input type="number" {...register('height', { required: 'La altura es obligatoria' })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                  {errors.height && <p className="text-red-400 text-sm mt-1">{errors.height.message}</p>}
                </div>
              </div>
               <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">Grasa Corporal (%) (Opcional)</label>
                  <input type="number" step="0.1" {...register('bodyFat')} placeholder="Se estimará si se deja en blanco" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                  {errors.bodyFat && <p className="text-red-400 text-sm mt-1">{errors.bodyFat.message}</p>}
                </div>
              <Button type="button" onClick={nextStep} className="w-full">Siguiente</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h2 className="text-xl font-semibold text-brand-secondary">Paso 2: Objetivos y Experiencia</h2>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Tu Objetivo Principal</label>
                <select {...register('goal', { required: true })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary">
                  <option value={Goal.MUSCLE_GAIN_MINIMIZE_FAT}>Ganar músculo minimizando grasa</option>
                  <option value={Goal.FAT_LOSS_PRESERVE_MUSCLE}>Perder grasa preservando músculo</option>
                  <option value={Goal.BODY_RECOMPOSITION}>Recomposición corporal</option>
                  <option value={Goal.MAINTENANCE}>Mantenimiento</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Nivel de Experiencia</label>
                <select {...register('experience', { required: true })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary">
                  <option value={ExperienceLevel.BEGINNER}>Principiante (0-1 años)</option>
                  <option value={ExperienceLevel.INTERMEDIATE}>Intermedio (1-3 años)</option>
                  <option value={ExperienceLevel.ADVANCED}>Avanzado (3+ años)</option>
                </select>
              </div>
               <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Somatotipo Predominante</label>
                <select {...register('somatotype', { required: true })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary">
                  <option value={Somatotype.ECTOMORPH}>Ectomorfo</option>
                  <option value={Somatotype.MESOMORPH}>Mesomorfo</option>
                  <option value={Somatotype.ENDOMORPH}>Endomorfo</option>
                </select>
              </div>
               <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Estilo de Entrenamiento</label>
                <select {...register('trainingStyle', { required: true })} defaultValue={TrainingStyle.HYPERTROPHY} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary">
                  <option value={TrainingStyle.HYPERTROPHY}>Hipertrofia</option>
                  <option value={TrainingStyle.STRENGTH}>Fuerza</option>
                  <option value={TrainingStyle.POWERBUILDING}>Powerbuilding</option>
                  <option value={TrainingStyle.BODYBUILDING}>Bodybuilding</option>
                  <option value={TrainingStyle.CALISTHENICS}>Calistenia</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-300">Días de entrenamiento / semana</label>
                <input type="number" {...register('trainingDays', { required: true, min: 2, max: 7 })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" defaultValue="3"/>
                {errors.trainingDays && <p className="text-red-400 text-sm mt-1">Mínimo 2, máximo 7 días</p>}
              </div>
              <div className="flex justify-between">
                <Button type="button" onClick={prevStep} variant="secondary">Anterior</Button>
                <Button type="button" onClick={nextStep}>Siguiente</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-semibold text-brand-secondary">Paso 3: Dieta y Salud</h2>
                 <div>
                    <label className="block mb-1 text-sm font-medium text-gray-300">Tipo de Dieta</label>
                    <select {...register('dietType', { required: true })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary">
                      <option value={DietType.OMNIVORE}>Omnívora</option>
                      <option value={DietType.VEGETARIAN}>Vegetariana</option>
                      <option value={DietType.VEGAN}>Vegana</option>
                      <option value={DietType.KETO}>Cetogénica</option>
                      <option value={DietType.CUSTOM}>Personalizada</option>
                    </select>
                </div>
                 <div>
                    <label className="block mb-1 text-sm font-medium text-gray-300">Lesiones o Limitaciones (opcional)</label>
                    <textarea {...register('injuries')} placeholder="Ej: Dolor lumbar al hacer sentadilla..." className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" rows={2}></textarea>
                </div>
                 <div>
                    <label className="block mb-1 text-sm font-medium text-gray-300">Alimentos Preferidos (opcional)</label>
                    <input {...register('preferredFoods')} placeholder="Ej: pollo, arroz, brócoli..." className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                 <div>
                    <label className="block mb-1 text-sm font-medium text-gray-300">Alimentos a Evitar (opcional)</label>
                    <input {...register('avoidedFoods')} placeholder="Ej: lácteos, gluten..." className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-300">Nombre de tu Suplemento de Proteína (opcional)</label>
                    <input {...register('proteinSupplementName')} placeholder="Ej: Whey Gold Standard" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div>
                    <label className="block mb-1 text-sm font-medium text-gray-300">Nombre de tu Suplemento de Carbs (opcional)</label>
                    <input {...register('carbSupplementName')} placeholder="Ej: Amilopectina, Dextrosa" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div className="flex justify-between">
                    <Button type="button" onClick={prevStep} variant="secondary">Anterior</Button>
                    <Button type="button" onClick={nextStep}>Siguiente</Button>
                </div>
            </div>
          )}
          
           {step === 4 && (
            <div className="space-y-4 animate-fade-in">
                <h2 className="text-xl font-semibold text-brand-secondary">Paso 4: Tu Horario Diario</h2>
                 <div>
                    <label className="block mb-1 text-sm font-medium text-gray-300">Hora de Despertar</label>
                    <input type="time" {...register('wakeUpTime', { required: true })} defaultValue="07:00" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                 <div>
                    <label className="block mb-1 text-sm font-medium text-gray-300">Hora de Entrenar</label>
                    <input type="time" {...register('trainingTime', { required: true })} defaultValue="18:00" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                 <div>
                    <label className="block mb-1 text-sm font-medium text-gray-300">Hora de Dormir</label>
                    <input type="time" {...register('sleepTime', { required: true })} defaultValue="23:00" className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                </div>
                <div className="flex justify-between">
                    <Button type="button" onClick={prevStep} variant="secondary">Anterior</Button>
                    <Button type="submit">Crear Perfil</Button>
                </div>
            </div>
          )}
        </form>

        {users.length > 0 && (
          <p className="text-center text-sm text-gray-400 mt-6">
            ¿Ya tienes un perfil?{' '}
            <Link to="/profiles" className="font-medium text-brand-primary hover:underline">
              Selecciona uno existente
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
};

export default ProfileSetup;