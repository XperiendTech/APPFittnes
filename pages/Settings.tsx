
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useUser } from '../context/UserContext';
import { UserProfile, Goal, ExperienceLevel, Gender, Somatotype, DietType, TrainingStyle } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '../components/icons/Icons';

const Settings: React.FC = () => {
  const { activeUser: user, updateUser } = useUser();
  const navigate = useNavigate();

  if (!user) {
    navigate('/');
    return null;
  }

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<UserProfile>({
    defaultValues: user.profile,
  });

  const onSubmit: SubmitHandler<UserProfile> = (data) => {
    const updatedProfile: UserProfile = {
      ...user.profile,
      ...data,
      age: Number(data.age),
      weight: Number(data.weight),
      height: Number(data.height),
      bodyFat: Number(data.bodyFat),
      trainingDays: Number(data.trainingDays),
    };
    updateUser({ ...user, profile: updatedProfile });
    alert("Perfil actualizado con éxito!");
    navigate('/');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Volver">
                <ArrowLeftIcon className="w-6 h-6 text-brand-primary" />
            </button>
            <h1 className="text-3xl font-bold text-white">Ajustes del Perfil</h1>
        </div>
      
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <Card>
                <h2 className="text-xl font-semibold text-brand-secondary mb-4">Información Física</h2>
                <div className="space-y-4">
                     <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">Nombre</label>
                        <input {...register('name', { required: 'El nombre es obligatorio' })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                        {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                         <div>
                            <label className="block mb-1 text-sm font-medium text-gray-300">Grasa Corporal (%)</label>
                            <input type="number" step="0.1" {...register('bodyFat')} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                            {errors.bodyFat && <p className="text-red-400 text-sm mt-1">{errors.bodyFat.message}</p>}
                        </div>
                         <div>
                            <label className="block mb-1 text-sm font-medium text-gray-300">Somatotipo</label>
                            <select {...register('somatotype', { required: true })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary">
                                <option value={Somatotype.ECTOMORPH}>Ectomorfo</option>
                                <option value={Somatotype.MESOMORPH}>Mesomorfo</option>
                                <option value={Somatotype.ENDOMORPH}>Endomorfo</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Card>

             <Card>
                <h2 className="text-xl font-semibold text-brand-secondary mb-4">Objetivos y Entrenamiento</h2>
                <div className="space-y-4">
                     <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">Objetivo Principal</label>
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
                        <label className="block mb-1 text-sm font-medium text-gray-300">Estilo de Entrenamiento</label>
                        <select {...register('trainingStyle', { required: true })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary">
                            <option value={TrainingStyle.HYPERTROPHY}>Hipertrofia</option>
                            <option value={TrainingStyle.STRENGTH}>Fuerza</option>
                            <option value={TrainingStyle.POWERBUILDING}>Powerbuilding</option>
                            <option value={TrainingStyle.BODYBUILDING}>Bodybuilding</option>
                            <option value={TrainingStyle.CALISTHENICS}>Calistenia</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">Días de entrenamiento / semana</label>
                        <input type="number" {...register('trainingDays', { required: true, min: 2, max: 7 })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-brand-primary focus:border-brand-primary" />
                        {errors.trainingDays && <p className="text-red-400 text-sm mt-1">Mínimo 2, máximo 7 días</p>}
                    </div>
                </div>
            </Card>

            <Card>
                <h2 className="text-xl font-semibold text-brand-secondary mb-4">Dieta, Suplementos y Horarios</h2>
                <div className="space-y-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div>
                            <label className="block mb-1 text-sm font-medium text-gray-300">Hora de Despertar</label>
                            <input type="time" {...register('wakeUpTime', { required: true })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white" />
                        </div>
                         <div>
                            <label className="block mb-1 text-sm font-medium text-gray-300">Hora de Entrenar</label>
                            <input type="time" {...register('trainingTime', { required: true })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white" />
                        </div>
                         <div>
                            <label className="block mb-1 text-sm font-medium text-gray-300">Hora de Dormir</label>
                            <input type="time" {...register('sleepTime', { required: true })} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white" />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">Lesiones o Limitaciones</label>
                        <textarea {...register('injuries')} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white" rows={2}></textarea>
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">Alimentos Preferidos</label>
                        <input {...register('preferredFoods')} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white" />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">Alimentos a Evitar</label>
                        <input {...register('avoidedFoods')} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white" />
                    </div>
                     <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">Nombre de tu Suplemento de Proteína (opcional)</label>
                        <input {...register('proteinSupplementName')} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white" />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-300">Nombre de tu Suplemento de Carbs (opcional)</label>
                        <input {...register('carbSupplementName')} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white" />
                    </div>
                </div>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" disabled={!isDirty}>Guardar Cambios</Button>
            </div>
        </form>
    </div>
  );
};

export default Settings;