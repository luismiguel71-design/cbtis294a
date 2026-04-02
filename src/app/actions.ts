
'use server';

import { educativeChatbot } from '@/ai/flows/educative-chatbot-flow';
import { z } from 'zod';
import { addEvent, deleteEvent, updateEvent, addSchedule, getLatestSchedule } from '@/lib/firebase/firestore';
import { signInUser } from '@/lib/firebase/auth';
import { revalidatePath } from 'next/cache';
import { generateSchedule, type ScheduleGeneratorInput } from '@/ai/flows/schedule-generator-flow';

const EducativeChatbotInputSchema = z.object({
  query: z.string().min(1, 'La consulta no puede estar vacía.'),
});

export async function getChatbotResponse(query: string) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy_key') {
     // Mock response for demo
     const lowerQuery = query.toLowerCase();
     if (lowerQuery.includes('carrera') || lowerQuery.includes('oferta')) {
       return { response: 'En el CBTIS 294 ofrecemos las excelentes carreras técnicas de: Inteligencia Artificial, Inteligencia de Negocios, Urbanismo y Cosmetología. ¿Te gustaría conocer el perfil de egreso de alguna?' };
     }
     if (lowerQuery.includes('horario') || lowerQuery.includes('atencion') || lowerQuery.includes('hora')) {
       return { response: 'Nuestro horario de atención administrativa es de 7:00 a 15:00 hrs. de lunes a viernes.' };
     }
     if (lowerQuery.includes('misión') || lowerQuery.includes('vision')) {
       return { response: 'Nuestra misión es formar técnicos profesionales competentes que contribuyan al desarrollo tecnológico y social del país.' };
     }
     return { response: '¡Hola! Soy el asistente virtual del CBTIS 294. Puedo ayudarte con información sobre nuestras carreras (IA, Negocios, Urbanismo, Cosmetología), horarios de atención (7:00-15:00) y mucho más. ¿Qué te gustaría saber?' };
  }
  try {
    const validatedInput = EducativeChatbotInputSchema.safeParse({ query });

    if (!validatedInput.success) {
      return { error: 'La entrada no es válida.' };
    }

    const result = await educativeChatbot({ query: validatedInput.data.query });
    return { response: result.response };
  } catch (error) {
    console.error('Error getting chatbot response:', error);
    return { error: 'Lo siento, no puedo responder en este momento. Por favor, intenta de nuevo más tarde.' };
  }
}

const eventFormSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  imageUrl: z.string().url('Por favor, introduce una URL de imagen válida.'),
});

export async function addEventAction(values: z.infer<typeof eventFormSchema>) {
    const validatedFields = eventFormSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            error: "Datos inválidos.",
        };
    }

    try {
        await addEvent(validatedFields.data);
        revalidatePath('/admin/eventos');
        revalidatePath('/noticias');
        revalidatePath('/');
        return { success: "Evento creado exitosamente." };
    } catch (error) {
        return { error: "No se pudo crear el evento." };
    }
}

const updateEventFormSchema = eventFormSchema.extend({
    id: z.string().min(1, "El ID del evento es requerido."),
});

export async function updateEventAction(values: z.infer<typeof updateEventFormSchema>) {
    const validatedFields = updateEventFormSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            error: "Datos inválidos.",
        };
    }

    const { id, ...eventData } = validatedFields.data;

    try {
        await updateEvent(id, eventData);
        revalidatePath('/admin/eventos');
        revalidatePath(`/noticias/${id}`);
        revalidatePath('/noticias');
        revalidatePath('/');
        return { success: "Evento actualizado exitosamente." };
    } catch (error) {
        return { error: "No se pudo actualizar el evento." };
    }
}

const deleteEventSchema = z.object({
    id: z.string().min(1, "El ID del evento es requerido."),
});

export async function deleteEventAction(id: string) {
    const validatedFields = deleteEventSchema.safeParse({ id });

    if (!validatedFields.success) {
        return {
            error: "ID de evento inválido.",
        };
    }

    try {
        await deleteEvent(validatedFields.data.id);
        revalidatePath('/admin/eventos');
        revalidatePath('/noticias');
        revalidatePath('/');
        return { success: "Evento eliminado exitosamente." };
    } catch (error) {
        return { error: "No se pudo eliminar el evento." };
    }
}

const SubjectActionSchema = z.object({
    name: z.string().min(1, 'Materia es requerida.'),
    hours: z.coerce.number().min(1, 'Horas debe ser al menos 1.'),
    teacher: z.string().min(1, 'Docente es requerido.'),
    group: z.string().min(1),
});

const TeacherActionSchema = z.object({
  name: z.string().min(1, 'El nombre del docente es requerido.'),
  availability: z.string().min(1, 'La disponibilidad del docente es requerida.'),
});

const ScheduleGeneratorInputSchema = z.object({
  subjects: z.array(SubjectActionSchema).min(1, 'Se requiere al menos una materia para generar el horario.'),
  teachers: z.array(TeacherActionSchema).min(1, 'Se requiere al menos un docente para generar el horario.'),
  prioritizeCoreSubjects: z.boolean().optional(),
  allowLongBlocksForProgramming: z.boolean().optional(),
});


export async function generateScheduleAction(input: ScheduleGeneratorInput) {
  if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    return { error: 'La API Key de Gemini no está configurada. Por favor, añádela como variable de entorno (GEMINI_API_KEY).' };
  }
  try {
    const validatedInput = ScheduleGeneratorInputSchema.safeParse(input);

    if (!validatedInput.success) {
      console.error(validatedInput.error);
      const firstError = validatedInput.error.errors[0]?.message || 'Los datos de entrada no son válidos.';
      return { error: firstError };
    }

    const result = await generateSchedule(validatedInput.data);
    await addSchedule(result);
    revalidatePath('/admin/horarios');
    revalidatePath('/horarios');
    return { schedule: result.schedule };
  } catch (error) {
    console.error('Error generating schedule:', error);
    const errorMessage = error instanceof Error
      ? error.message
      : 'Lo siento, no se pudo generar el horario. Revisa los datos e intenta de nuevo.';
    return { error: errorMessage };
  }
}

export async function getLatestScheduleAction() {
    try {
        const schedule = await getLatestSchedule();
        return { schedule: schedule?.schedule || null };
    } catch (error) {
        return { error: "No se pudo obtener el último horario." };
    }
}

const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export async function loginAction(values: z.infer<typeof loginSchema>) {
    const validatedFields = loginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Datos de login inválidos." };
    }

    const { email, password } = validatedFields.data;

    // Hardcoded credentials for local demo if Firebase Auth fails or for quick testing
    if (email === 'admin@cbtis294.edu.mx' && password === 'cbtis294_2026_secure') {
      // In a real app, we'd use signInWithEmailAndPassword from Firebase
      // But we mock the success here to ensure the user can test immediately
      return { success: "Login exitoso (Modo Demo)." };
    }

    try {
        await signInUser(email, password);
        return { success: "Login exitoso." };
    } catch (error: any) {
        console.error("Login error:", error);
        return { error: "Acceso denegado. Verifica tus credenciales." };
    }
}
