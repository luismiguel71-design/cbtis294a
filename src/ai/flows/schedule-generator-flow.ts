'use server';
/**
 * @fileOverview A Genkit flow for generating a school schedule based on teacher constraints, subjects, and pedagogical rules.
 *
 * - generateSchedule - A function that handles the schedule generation process.
 * - ScheduleGeneratorInput - The input type for the generateSchedule function.
 * - ScheduleGeneratorOutput - The return type for the generateSchedule function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SubjectSchema = z.object({
  name: z.string().describe('The name of the subject.'),
  hours: z.number().describe('The total number of hours per week for this subject.'),
  teacher: z.string().describe('The name of the teacher assigned to this subject.'),
  group: z.string().describe('The group taking this subject (e.g., "carrera-semestre").'),
});

const TeacherSchema = z.object({
  name: z.string().describe('The name of the teacher.'),
  availability: z.string().describe('A string describing the teacher\'s available time slots. E.g., "Lunes 9:00-11:00, Miércoles 10:00-13:00".'),
});

const ScheduleGeneratorInputSchema = z.object({
  subjects: z.array(SubjectSchema).describe('A list of all subjects to be scheduled.'),
  teachers: z.array(TeacherSchema).describe('A list of all teachers with their availability.'),
  prioritizeCoreSubjects: z.boolean().optional().describe('If true, subjects with "pensamiento" or "ciencias" in their name should be scheduled in the morning.'),
  allowLongBlocksForProgramming: z.boolean().optional().describe('If true, allows subjects with "algoritmos" or "programación" to have blocks of up to 5 consecutive hours.'),
});
export type ScheduleGeneratorInput = z.infer<typeof ScheduleGeneratorInputSchema>;

const TimeSlotSchema = z.object({
  time: z.string().describe('The time slot for the class, e.g., "07:00-08:00".'),
  group: z.string().describe('The group taking the class.'),
  subject: z.string().describe('The subject being taught.'),
  teacher: z.string().describe('The teacher for the class.'),
});

const ScheduleGeneratorOutputSchema = z.object({
  schedule: z.object({
    Lunes: z.array(TimeSlotSchema),
    Martes: z.array(TimeSlotSchema),
    Miércoles: z.array(TimeSlotSchema),
    Jueves: z.array(TimeSlotSchema),
    Viernes: z.array(TimeSlotSchema),
  }).describe('The generated weekly schedule, organized by day.'),
});
export type ScheduleGeneratorOutput = z.infer<typeof ScheduleGeneratorOutputSchema>;

export async function generateSchedule(input: ScheduleGeneratorInput): Promise<ScheduleGeneratorOutput> {
  return scheduleGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scheduleGeneratorPrompt',
  input: { schema: ScheduleGeneratorInputSchema },
  output: { schema: ScheduleGeneratorOutputSchema },
  prompt: `Eres un experto planificador de horarios escolares. Tu tarea es generar un horario de clases para la semana (Lunes a Viernes) basado en una lista de materias, docentes y sus restricciones.

**Reglas y Restricciones Fundamentales:**
1.  El horario de clases es de 7:00 AM a 3:00 PM (15:00).
2.  Las clases deben ser en bloques de 1 hora (e.g., 07:00-08:00, 08:00-09:00, ..., 14:00-15:00).
3.  Un docente no puede enseñar a dos grupos diferentes al mismo tiempo.
4.  Un grupo no puede tener dos clases diferentes al mismo tiempo.
5.  Debes respetar la disponibilidad horaria de cada docente.
6.  Cada materia debe cumplir con el total de horas semanales asignadas.
7.  Intenta distribuir la carga de trabajo de los docentes de manera equitativa.

**Sugerencias Pedagógicas (Importante):**
*   Si una materia tiene 3 horas o más a la semana, **DEBES** dividir las clases en diferentes días. No programes 3 o más horas seguidas de la misma materia para el mismo grupo en un solo día.
*   Idealmente, divide las materias con muchas horas en bloques de 1 o 2 horas. Por ejemplo, una materia de 4 horas semanales podría ser 2 horas un día y 2 horas otro día.

**Reglas Avanzadas (si se especifican):**
{{#if prioritizeCoreSubjects}}
*   **PRIORIDAD ALTA:** Las materias que contengan "pensamiento" o "ciencias" en su nombre DEBEN ser programadas en las primeras horas del día (de 7:00 AM a 11:00 AM) siempre que sea posible.
{{/if}}
{{#if allowLongBlocksForProgramming}}
*   **EXCEPCIÓN:** Para las materias que contengan "algoritmos" o "programación" en su nombre, se PERMITE programar bloques de hasta 5 horas seguidas en un mismo día si es necesario para cumplir con el total de horas semanales. La regla general de no programar más de 2 horas seguidas no aplica para estas materias específicas.
{{/if}}

**Información para la Planificación:**

**Docentes y su Disponibilidad:**
{{#each teachers}}
-   **Nombre:** {{name}}
    **Disponibilidad:** {{availability}}
{{/each}}

**Materias a Programar:**
{{#each subjects}}
-   **Materia:** {{name}}
    **Grupo:** {{group}}
    **Horas por Semana:** {{hours}}
    **Docente Asignado:** {{teacher}}
{{/each}}

Genera el horario en el formato JSON especificado. Asegúrate de que la salida sea un JSON válido que se ajuste al esquema de salida. No incluyas texto adicional ni explicaciones fuera del JSON.
`,
});

const scheduleGeneratorFlow = ai.defineFlow(
  {
    name: 'scheduleGeneratorFlow',
    inputSchema: ScheduleGeneratorInputSchema,
    outputSchema: ScheduleGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('La IA no pudo generar un horario con las restricciones dadas. Por favor, verifica que no haya conflictos e inténtalo de nuevo.');
    }
    // Sort the schedule for each day by time
    for (const day in output.schedule) {
        output.schedule[day as keyof typeof output.schedule].sort((a, b) => a.time.localeCompare(b.time));
    }
    return output;
  }
);
