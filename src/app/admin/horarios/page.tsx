'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toPng } from 'html-to-image';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, PlusCircle, Trash2, Download, Pencil, CloudIcon } from 'lucide-react';
import { generateScheduleAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ScheduleGeneratorOutput } from '@/ai/flows/schedule-generator-flow';
import { careers, teachers as defaultTeachersList } from '@/app/lib/school-data';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/lib/firebase/auth';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const scheduleFormSchema = z.object({
  subjects: z.array(z.object({
    name: z.string().min(1, 'Materia es requerida.'),
    hours: z.coerce.number().min(1, 'Horas debe ser al menos 1.'),
    teacher: z.string().min(1, 'Docente es requerido.'),
    group: z.string().min(1),
  })),
  teachers: z.array(z.object({
    name: z.string().min(1, 'Nombre es requerido.'),
    availability: z.string().min(1, 'Disponibilidad es requerida.'),
  })),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const semesters = ["1", "2", "3", "4", "5", "6"];
const LOCAL_STORAGE_KEY = 'cbtis_schedule_data';
const timeSlots = ["07:00-08:00", "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00", "14:00-15:00"];
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

type Teacher = { index: number; name: string; availability: string; };
type Subject = { index: number; name: string; hours: number; teacher: string; group: string };


const ScheduleTable = React.forwardRef<HTMLDivElement, { schedule: ScheduleGeneratorOutput['schedule'], title: string, subtitle?: string, detailKey: 'teacher' | 'group' }>(({ schedule, title, subtitle, detailKey }, ref) => {
    return (
        <div ref={ref} className="bg-white p-4 rounded-lg text-black">
            <h2 className="text-xl font-bold text-center mb-2">{title}</h2>
            {subtitle && <h3 className="text-lg font-semibold text-center mb-4">{subtitle}</h3>}
            <div className="grid grid-cols-6 border border-gray-300">
                <div className="font-bold text-center p-2 border-b border-r border-gray-300 bg-gray-100">Hora</div>
                {days.map(day => (
                    <div key={day} className="font-bold text-center p-2 border-b border-r border-gray-300 bg-gray-100 last:border-r-0">{day}</div>
                ))}
                {timeSlots.map(time => (
                    <React.Fragment key={time}>
                        <div className="font-semibold text-center p-2 border-b border-r border-gray-300 bg-gray-50 flex items-center justify-center">{time}</div>
                        {days.map(day => {
                            const dayKey = day as keyof typeof schedule;
                            const slotData = schedule[dayKey]?.find(s => s.time === time);
                            return (
                                <div key={`${day}-${time}`} className="p-2 border-b border-r border-gray-300 last:border-r-0 min-h-[70px] text-xs">
                                   {slotData ? (
                                        <div>
                                            <p className="font-bold">{slotData.subject}</p>
                                            <p className="text-gray-600">{slotData[detailKey]}</p>
                                        </div>
                                   ) : null}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
});
ScheduleTable.displayName = "ScheduleTable";

function ScheduleAdminForm({ initialData }: { initialData: ScheduleFormValues }) {
  const [activeScheduleGroup, setActiveScheduleGroup] = useState<string | null>(null);
  const [generatingGroup, setGeneratingGroup] = useState<string | null>(null);
  const { toast } = useToast();
  const scheduleRef = useRef<HTMLDivElement>(null);
  
  const [selectedCareer, setSelectedCareer] = useState(careers[0].slug);
  const [selectedSemester, setSelectedSemester] = useState(semesters[0]);
  const [openAccordionGroup, setOpenAccordionGroup] = useState<string[]>([]);

  // States for uncontrolled inputs
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherAvailability, setNewTeacherAvailability] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectHours, setNewSubjectHours] = useState('');
  const [newSubjectTeacher, setNewSubjectTeacher] = useState('');
  
  // State for edit dialogs
  const [isTeacherEditDialogOpen, setIsTeacherEditDialogOpen] = useState(false);
  const [isSubjectEditDialogOpen, setIsSubjectEditDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  // State for edit dialog inputs
  const [teacherEditName, setTeacherEditName] = useState('');
  const [teacherEditAvailability, setTeacherEditAvailability] = useState('');
  const [subjectEditName, setSubjectEditName] = useState('');
  const [subjectEditHours, setSubjectEditHours] = useState('');
  const [subjectEditTeacher, setSubjectEditTeacher] = useState('');

  // New states for advanced features
  const [allGeneratedSchedules, setAllGeneratedSchedules] = useState<Record<string, ScheduleGeneratorOutput['schedule']>>({});
  const [viewMode, setViewMode] = useState<'group' | 'teacher'>('group');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [prioritizeCore, setPrioritizeCore] = useState(false);
  const [allowLongBlocks, setAllowLongBlocks] = useState(false);
  
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: initialData,
  });

  const { control, watch, getValues, reset } = form;

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  // Save data to localStorage on any change
  useEffect(() => {
    const subscription = watch(() => {
      try {
        const currentValues = getValues();
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(currentValues));
      } catch (error) {
        console.error("Failed to save schedule data to localStorage", error);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, getValues]);
  
  const { fields: subjectFields, append: appendSubject, remove: removeSubject, update: updateSubject } = useFieldArray({ control, name: "subjects" });
  const { fields: teacherFields, append: appendTeacher, remove: removeTeacher, update: updateTeacher } = useFieldArray({ control, name: "teachers" });

  const handleGenerateForGroup = async (group: string) => {
    setGeneratingGroup(group);
    
    const allTeachers = getValues('teachers');
    const groupSubjects = getValues('subjects').filter(s => s.group === group);
    
    if (groupSubjects.length === 0) {
      toast({ variant: 'destructive', title: 'No hay materias', description: `Agrega materias al grupo "${group}" para poder generar un horario.` });
      setGeneratingGroup(null);
      return;
    }
     if (allTeachers.length === 0) {
      toast({ variant: 'destructive', title: 'No hay docentes', description: 'Agrega al menos un docente para poder generar un horario.' });
      setGeneratingGroup(null);
      return;
    }

    const result = await generateScheduleAction({ 
        teachers: allTeachers, 
        subjects: groupSubjects,
        prioritizeCoreSubjects: prioritizeCore,
        allowLongBlocksForProgramming: allowLongBlocks,
    });

    if (result.error) {
      toast({ variant: 'destructive', title: 'Error al generar horario', description: result.error });
    } else if (result.schedule) {
      setAllGeneratedSchedules(prev => ({...prev, [group]: result.schedule!}));
      setActiveScheduleGroup(group);
      toast({ title: 'Horario Generado y Sincronizado', description: `El horario para ${group} ha sido guardado en la nube.` });
    }
    setGeneratingGroup(null);
  }

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    toast({ title: 'Iniciando generación masiva...', description: 'Esto se guardará automáticamente en la nube.' });
    
    const allGroups = Array.from(new Set(subjectFields.map(s => s.group)));
    const allTeachers = getValues('teachers');
    let newSchedules: Record<string, ScheduleGeneratorOutput['schedule']> = {};
    let errors: string[] = [];

    for (const group of allGroups) {
        const groupSubjects = getValues('subjects').filter(s => s.group === group);
        if (groupSubjects.length > 0) {
            const result = await generateScheduleAction({
                teachers: allTeachers,
                subjects: groupSubjects,
                prioritizeCoreSubjects: prioritizeCore,
                allowLongBlocksForProgramming: allowLongBlocks,
            });
            if (result.schedule) {
                newSchedules[group] = result.schedule;
            } else {
                errors.push(group);
            }
        }
    }

    setAllGeneratedSchedules(prev => ({...prev, ...newSchedules}));
    setIsGeneratingAll(false);

    if (errors.length > 0) {
        toast({ variant: 'destructive', title: 'Generación con errores', description: `No se pudo generar horario para: ${errors.join(', ')}` });
    } else {
        toast({ title: 'Generación Sincronizada', description: 'Todos los horarios han sido guardados en la nube.' });
    }
  };

  const handleAddTeacher = () => {
    if (newTeacherName && newTeacherAvailability) {
      if (getValues('teachers').some(t => t.name.toLowerCase() === newTeacherName.toLowerCase())) {
        toast({ variant: 'destructive', title: 'Docente duplicado', description: 'Este docente ya ha sido añadido.' });
        return;
      }
      appendTeacher({ name: newTeacherName, availability: newTeacherAvailability });
      setNewTeacherName('');
      setNewTeacherAvailability('');
    } else {
      toast({ variant: 'destructive', title: 'Faltan datos del docente', description: "Por favor, completa el nombre y la disponibilidad." });
    }
  };

  const handleAddSubject = () => {
    if (newSubjectName && newSubjectHours && newSubjectTeacher) {
      const group = `${careers.find(c => c.slug === selectedCareer)?.title || selectedCareer} ${selectedSemester}° Semestre`;
      appendSubject({ name: newSubjectName, hours: parseInt(newSubjectHours), teacher: newSubjectTeacher, group });
      setNewSubjectName('');
      setNewSubjectHours('');
      setNewSubjectTeacher('');
    } else {
      toast({ variant: 'destructive', title: 'Faltan datos de la materia', description: 'Por favor, completa todos los campos de la materia.' });
    }
  };
  
  const handleExport = useCallback(() => {
    if (scheduleRef.current === null) {
      toast({ variant: 'destructive', title: 'Nada que exportar', description: 'Primero genera y selecciona un horario.' });
      return;
    }
    toPng(scheduleRef.current, { cacheBust: true, backgroundColor: 'white', pixelRatio: 1.5 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        const name = viewMode === 'group' ? activeScheduleGroup : selectedTeacher;
        link.download = `horario-${name?.replace(/\s+/g, '-') || 'export'}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
        toast({
          variant: 'destructive',
          title: 'Error al exportar',
          description: 'No se pudo generar la imagen del horario.'
        });
      });
  }, [activeScheduleGroup, selectedTeacher, viewMode, toast]);

  const handleOpenTeacherEditDialog = (index: number) => {
    const teacher = teacherFields[index];
    setEditingTeacher({ index, ...teacher });
    setTeacherEditName(teacher.name);
    setTeacherEditAvailability(teacher.availability);
    setIsTeacherEditDialogOpen(true);
  };
  
  const handleUpdateTeacher = () => {
    if (!editingTeacher || !teacherEditName || !teacherEditAvailability) {
        toast({ variant: 'destructive', title: 'Datos incompletos', description: 'El nombre y la disponibilidad no pueden estar vacíos.' });
        return;
    };
    updateTeacher(editingTeacher.index, { name: teacherEditName, availability: teacherEditAvailability });
    setIsTeacherEditDialogOpen(false);
    setEditingTeacher(null);
    toast({ title: 'Docente Actualizado', description: 'Los datos del docente se han guardado.' });
  };
  
  const handleOpenSubjectEditDialog = (index: number) => {
    const subject = subjectFields[index];
    setEditingSubject({ index, ...subject });
    setSubjectEditName(subject.name);
    setSubjectEditHours(String(subject.hours));
    setSubjectEditTeacher(subject.teacher);
    setIsSubjectEditDialogOpen(true);
  };

  const handleUpdateSubject = () => {
    if (!editingSubject || !subjectEditName || !subjectEditHours || !subjectEditTeacher) {
        toast({ variant: 'destructive', title: 'Datos incompletos', description: 'Todos los campos de la materia son requeridos.' });
        return;
    };
    updateSubject(editingSubject.index, { 
        ...editingSubject, 
        name: subjectEditName, 
        hours: parseInt(subjectEditHours), 
        teacher: subjectEditTeacher 
    });
    setIsSubjectEditDialogOpen(false);
    setEditingSubject(null);
    toast({ title: 'Materia Actualizada', description: 'Los datos de la materia se han guardado.' });
  };

  const groups = Array.from(new Set(subjectFields.map(s => s.group))).sort();

  const teacherSchedules = useMemo(() => {
    const schedules: Record<string, ScheduleGeneratorOutput['schedule']> = {};
    const allTeachers = teacherFields.map(t => t.name);

    for (const teacherName of allTeachers) {
        const teacherSchedule: ScheduleGeneratorOutput['schedule'] = { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [] };
        
        for (const groupSchedule of Object.values(allGeneratedSchedules)) {
            for (const day of days) {
                const dayKey = day as keyof typeof groupSchedule;
                const slotsForTeacher = groupSchedule[dayKey]?.filter(slot => slot.teacher === teacherName);
                if (slotsForTeacher) {
                    teacherSchedule[dayKey].push(...slotsForTeacher);
                }
            }
        }
        for (const day of days) {
            teacherSchedule[day as keyof typeof teacherSchedule]?.sort((a, b) => a.time.localeCompare(b.time));
        }

        schedules[teacherName] = teacherSchedule;
    }
    return schedules;
  }, [allGeneratedSchedules, teacherFields]);

  const activeGroupSchedule = activeScheduleGroup ? allGeneratedSchedules[activeScheduleGroup] : null;
  const selectedTeacherSchedule = selectedTeacher ? teacherSchedules[selectedTeacher] : null;

  return (
    <div className="container py-10 space-y-8">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
                <CloudIcon className="h-6 w-6 text-primary" />
                Panel de Generación de Horarios (Admin)
            </CardTitle>
            <CardDescription>Los cambios guardados aquí se subirán automáticamente a la nube y serán visibles para todos.</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <a href="/horarios" target="_blank">Ver Vista Pública</a>
          </Button>
        </CardHeader>
      </Card>
      
      <Form {...form}>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle>1. Gestionar Docentes</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input placeholder="Nombre del docente" value={newTeacherName} onChange={e => setNewTeacherName(e.target.value)} />
                  <Input placeholder="Ej: Lunes 7-11, Mié 10-13" value={newTeacherAvailability} onChange={e => setNewTeacherAvailability(e.target.value)} />
                </div>
                <Button type="button" onClick={handleAddTeacher} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4"/> Añadir Docente</Button>
                <div className="space-y-2 pt-4 max-h-60 overflow-y-auto">
                  {teacherFields.map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between p-2 border rounded-md gap-2">
                      <div><p className="font-semibold">{field.name}</p><p className="text-sm text-muted-foreground">{field.availability}</p></div>
                       <div className="flex gap-2">
                        <Button type="button" variant="outline" size="icon" onClick={() => handleOpenTeacherEditDialog(index)}><Pencil className="h-4 w-4"/></Button>
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeTeacher(index)}><Trash2 className="h-4 w-4"/></Button>
                      </div>
                    </div>
                  ))}
                  {teacherFields.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">Agrega al menos un docente.</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>2. Configurar Materias y Reglas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium text-sm">Añadir Materia</p>
                <div className="flex gap-4 items-end">
                  <div className="flex-1"><Label>Carrera</Label><Select value={selectedCareer} onValueChange={setSelectedCareer}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{careers.map(c => <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>)}</SelectContent></Select></div>
                  <div className="flex-1"><Label>Semestre</Label><Select value={selectedSemester} onValueChange={setSelectedSemester}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{semesters.map(s => <SelectItem key={s} value={s}>{s}° Semestre</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Input placeholder="Nombre de materia" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} />
                  <Input type="number" placeholder="Horas/semana" value={newSubjectHours} onChange={e => setNewSubjectHours(e.target.value)} />
                  <Select value={newSubjectTeacher} onValueChange={setNewSubjectTeacher}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar Docente"/></SelectTrigger>
                    <SelectContent>{watch('teachers').map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={handleAddSubject} className="w-full sm:w-auto"><PlusCircle className="mr-2 h-4 w-4"/> Añadir Materia</Button>
                <Separator className="my-6" />
                <p className="font-medium text-sm">Opciones Avanzadas de Planificación</p>
                 <div className="flex items-center space-x-2">
                    <Checkbox id="prioritize-core" checked={prioritizeCore} onCheckedChange={(checked) => setPrioritizeCore(Boolean(checked))} />
                    <Label htmlFor="prioritize-core" className="cursor-pointer text-sm font-normal">Priorizar materias de pensamiento y ciencias en primeras horas.</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Checkbox id="allow-long-blocks" checked={allowLongBlocks} onCheckedChange={(checked) => setAllowLongBlocks(Boolean(checked))}/>
                    <Label htmlFor="allow-long-blocks" className="cursor-pointer text-sm font-normal">Permitir bloques largos (hasta 5h) para materias de programación.</Label>
                </div>
              </CardContent>
            </Card>

          </div>
          <div className="space-y-8">
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Grupos Configurados y Generación</CardTitle>
                        <CardDescription>Gestiona materias y genera horarios.</CardDescription>
                    </div>
                    <Button type="button" onClick={handleGenerateAll} disabled={isGeneratingAll}>
                        {isGeneratingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Generar y Sincronizar Todo
                    </Button>
                </CardHeader>
                <CardContent>
                    {groups.length > 0 ? (
                        <Accordion type="multiple" className="w-full" value={openAccordionGroup} onValueChange={setOpenAccordionGroup}>
                        {groups.map(group => {
                            const groupSubjects = subjectFields.filter(s => s.group === group);
                            const subjectCountForGroup = groupSubjects.length;
                            const totalHoursForGroup = groupSubjects.reduce((total, subject) => total + (subject.hours || 0), 0);
                            
                            return (
                            <AccordionItem value={group} key={group}>
                                <AccordionTrigger>{group} ({subjectCountForGroup} materias, {totalHoursForGroup} horas)</AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    {groupSubjects.map((subject) => {
                                        const originalIndex = subjectFields.findIndex(sf => sf.id === subject.id);
                                        if (originalIndex === -1) return null;

                                        return (
                                            <div key={subject.id} className="flex items-center justify-between p-2 border rounded-md gap-2">
                                                <div><p className="font-semibold">{subject.name} ({subject.hours}h)</p><p className="text-sm text-muted-foreground">{subject.teacher}</p></div>
                                                <div className="flex gap-2">
                                                    <Button type="button" variant="outline" size="icon" onClick={() => handleOpenSubjectEditDialog(originalIndex)}><Pencil className="h-4 w-4"/></Button>
                                                    <Button type="button" variant="destructive" size="icon" onClick={() => removeSubject(originalIndex)}><Trash2 className="h-4 w-4"/></Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                    {subjectCountForGroup === 0 && <p className="text-sm text-center text-muted-foreground py-4">No hay materias para este grupo.</p>}
                                    <Button type="button" className="w-full mt-4" onClick={() => handleGenerateForGroup(group)} disabled={generatingGroup === group}>
                                        {generatingGroup === group ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generando...</> : `Generar Horario para ${group}`}
                                    </Button>
                                </AccordionContent>
                            </AccordionItem>
                            )
                        })}
                        </Accordion>
                    ) : (
                        <p className="text-sm text-center text-muted-foreground py-4">Añade materias para ver los grupos aquí.</p>
                    )}
                </CardContent>
            </Card>

            <Card className="min-h-[400px] sticky top-24">
              <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Previsualización</CardTitle>
                    <Button onClick={handleExport} variant="outline" size="sm" disabled={!activeGroupSchedule && !selectedTeacherSchedule}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'group' | 'teacher')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="group">Vista por Grupo</TabsTrigger>
                    <TabsTrigger value="teacher">Vista por Docente</TabsTrigger>
                  </TabsList>
                  <TabsContent value="group" className="mt-4">
                    {generatingGroup && <div className="flex flex-col items-center justify-center h-full gap-4 pt-10"><Loader2 className="h-12 w-12 animate-spin text-primary"/><p className="text-muted-foreground">Generando horario para {generatingGroup}...</p></div>}
                    {!generatingGroup && !activeGroupSchedule && <div className="flex items-center justify-center h-full pt-20 text-center text-muted-foreground"><p>El horario de un grupo aparecerá aquí una vez que se genere.</p></div>}
                    {activeGroupSchedule && <ScheduleTable ref={scheduleRef} schedule={activeGroupSchedule} title="Horario de Clases" subtitle={activeScheduleGroup} detailKey="teacher"/>}
                  </TabsContent>
                  <TabsContent value="teacher" className="mt-4 space-y-4">
                    <Select onValueChange={setSelectedTeacher} value={selectedTeacher}>
                        <SelectTrigger><SelectValue placeholder="Selecciona un docente para ver su horario"/></SelectTrigger>
                        <SelectContent>{teacherFields.map(t => <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                    {!selectedTeacher && <div className="flex items-center justify-center h-full pt-20 text-center text-muted-foreground"><p>Selecciona un docente.</p></div>}
                    {selectedTeacher && !selectedTeacherSchedule && <div className="flex items-center justify-center h-full pt-20 text-center text-muted-foreground"><p>No se encontró horario para este docente.</p></div>}
                    {selectedTeacherSchedule && <ScheduleTable ref={scheduleRef} schedule={selectedTeacherSchedule} title="Horario de Docente" subtitle={selectedTeacher} detailKey="group"/>}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>
      
      {/* Fragments of dialogs */}
      <Dialog open={isTeacherEditDialogOpen} onOpenChange={setIsTeacherEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Docente</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Nombre</Label><Input value={teacherEditName} onChange={(e) => setTeacherEditName(e.target.value)} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Disponibilidad</Label><Input value={teacherEditAvailability} onChange={(e) => setTeacherEditAvailability(e.target.value)} className="col-span-3" /></div>
          </div>
          <DialogFooter><Button onClick={() => setIsTeacherEditDialogOpen(false)} variant="outline">Cancelar</Button><Button onClick={handleUpdateTeacher}>Guardar Cambios</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isSubjectEditDialogOpen} onOpenChange={setIsSubjectEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Materia</DialogTitle></DialogHeader>
           <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Materia</Label><Input value={subjectEditName} onChange={(e) => setSubjectEditName(e.target.value)} className="col-span-3" /></div>
             <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Horas/Semana</Label><Input type="number" value={subjectEditHours} onChange={(e) => setSubjectEditHours(e.target.value)} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Docente</Label><Select value={subjectEditTeacher} onValueChange={setSubjectEditTeacher}><SelectTrigger className="col-span-3"><SelectValue/></SelectTrigger><SelectContent>{teacherFields.map((t) => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <DialogFooter><Button onClick={() => setIsSubjectEditDialogOpen(false)} variant="outline">Cancelar</Button><Button onClick={handleUpdateSubject}>Guardar Cambios</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


export default function AdminHorariosPage() {
  const [initialData, setInitialData] = useState<ScheduleFormValues | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = getCurrentUser((user) => {
        if (user) {
            setUser(user);
        } else {
            router.push('/login');
        }
        setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    let finalData: ScheduleFormValues;
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const validation = scheduleFormSchema.safeParse(parsedData);
        if (validation.success) {
          finalData = validation.data;
        } else {
          finalData = { subjects: [], teachers: defaultTeachersList.map(t => ({ name: t.name, availability: 'No especificada' })) };
        }
      } else {
        finalData = { subjects: [], teachers: defaultTeachersList.map(t => ({ name: t.name, availability: 'No especificada' })) };
      }
    } catch (error) {
      finalData = { subjects: [], teachers: defaultTeachersList.map(t => ({ name: t.name, availability: 'No especificada' })) };
    }
    setInitialData(finalData);
  }, []);

  if (authLoading || !initialData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) return null;

  return <ScheduleAdminForm initialData={initialData} />;
}
