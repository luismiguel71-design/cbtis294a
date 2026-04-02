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
import { Loader2, PlusCircle, Trash2, Download, Pencil, CloudIcon, Users, ExternalLink } from 'lucide-react';
import { generateScheduleAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ScheduleGeneratorOutput } from '@/ai/flows/schedule-generator-flow';
import { careers } from '@/app/lib/school-data';
import { getDocentes } from '@/lib/firebase/firestore';
import { Docente } from '@/lib/types';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/lib/firebase/auth';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Schema now only manages subjects — teachers come from Firebase Docentes
const scheduleFormSchema = z.object({
  subjects: z.array(z.object({
    name: z.string().min(1, 'Materia es requerida.'),
    hours: z.coerce.number().min(1, 'Horas debe ser al menos 1.'),
    teacher: z.string().min(1, 'Docente es requerido.'),
    group: z.string().min(1),
  })),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

const semesters = ["1", "2", "3", "4", "5", "6"];
const LOCAL_STORAGE_KEY = 'cbtis_schedule_subjects_v2'; // new key to avoid conflict with old data
const timeSlots = ["07:00-08:00", "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00", "14:00-15:00"];
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

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

function ScheduleAdminForm({ initialSubjects }: { initialSubjects: ScheduleFormValues['subjects'] }) {
  const [activeScheduleGroup, setActiveScheduleGroup] = useState<string | null>(null);
  const [generatingGroup, setGeneratingGroup] = useState<string | null>(null);
  const { toast } = useToast();
  const scheduleRef = useRef<HTMLDivElement>(null);
  
  const [selectedCareer, setSelectedCareer] = useState(careers[0].slug);
  const [selectedSemester, setSelectedSemester] = useState(semesters[0]);
  const [openAccordionGroup, setOpenAccordionGroup] = useState<string[]>([]);

  // Input states
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectHours, setNewSubjectHours] = useState('');
  const [newSubjectTeacher, setNewSubjectTeacher] = useState('');

  // Edit dialog states
  const [isSubjectEditDialogOpen, setIsSubjectEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectEditName, setSubjectEditName] = useState('');
  const [subjectEditHours, setSubjectEditHours] = useState('');
  const [subjectEditTeacher, setSubjectEditTeacher] = useState('');

  // Schedule states
  const [allGeneratedSchedules, setAllGeneratedSchedules] = useState<Record<string, ScheduleGeneratorOutput['schedule']>>({});
  const [viewMode, setViewMode] = useState<'group' | 'teacher'>('group');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [prioritizeCore, setPrioritizeCore] = useState(false);
  const [allowLongBlocks, setAllowLongBlocks] = useState(false);

  // Teachers from Firebase
  const [dbTeachers, setDbTeachers] = useState<Docente[]>([]);
  const [isLoadingDocentes, setIsLoadingDocentes] = useState(true);

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: { subjects: initialSubjects },
  });

  const { control, watch, getValues, reset } = form;

  // Load teachers from Firebase
  useEffect(() => {
    const load = async () => {
      setIsLoadingDocentes(true);
      const data = await getDocentes();
      setDbTeachers(data.filter(d => d.status === 'activo'));
      setIsLoadingDocentes(false);
    };
    load();
  }, []);

  // Save subjects to localStorage on change
  useEffect(() => {
    const subscription = watch(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(getValues('subjects')));
      } catch (e) {}
    });
    return () => subscription.unsubscribe();
  }, [watch, getValues]);

  const { fields: subjectFields, append: appendSubject, remove: removeSubject, update: updateSubject } = useFieldArray({ control, name: "subjects" });

  // Build teacher list for schedule generation (from Firebase)
  const teachersForSchedule = useMemo(() =>
    dbTeachers.map(t => ({ name: t.name, availability: 'Lunes a Viernes' })),
    [dbTeachers]
  );

  const handleGenerateForGroup = async (group: string) => {
    setGeneratingGroup(group);
    const groupSubjects = getValues('subjects').filter(s => s.group === group);
    
    if (groupSubjects.length === 0) {
      toast({ variant: 'destructive', title: 'No hay materias', description: `Agrega materias al grupo "${group}".` });
      setGeneratingGroup(null);
      return;
    }
    if (teachersForSchedule.length === 0) {
      toast({ variant: 'destructive', title: 'No hay docentes', description: 'Agrega docentes en el módulo "Docentes" primero.' });
      setGeneratingGroup(null);
      return;
    }

    const result = await generateScheduleAction({ 
        teachers: teachersForSchedule, 
        subjects: groupSubjects,
        prioritizeCoreSubjects: prioritizeCore,
        allowLongBlocksForProgramming: allowLongBlocks,
    });

    if (result.error) {
      toast({ variant: 'destructive', title: 'Error al generar horario', description: result.error });
    } else if (result.schedule) {
      setAllGeneratedSchedules(prev => ({...prev, [group]: result.schedule!}));
      setActiveScheduleGroup(group);
      toast({ title: 'Horario Generado', description: `Horario para ${group} listo.` });
    }
    setGeneratingGroup(null);
  };

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    const allGroups = Array.from(new Set(subjectFields.map(s => s.group)));
    let newSchedules: Record<string, ScheduleGeneratorOutput['schedule']> = {};
    let errors: string[] = [];

    for (const group of allGroups) {
      const groupSubjects = getValues('subjects').filter(s => s.group === group);
      if (groupSubjects.length > 0) {
        const result = await generateScheduleAction({
          teachers: teachersForSchedule,
          subjects: groupSubjects,
          prioritizeCoreSubjects: prioritizeCore,
          allowLongBlocksForProgramming: allowLongBlocks,
        });
        if (result.schedule) newSchedules[group] = result.schedule;
        else errors.push(group);
      }
    }

    setAllGeneratedSchedules(prev => ({...prev, ...newSchedules}));
    setIsGeneratingAll(false);

    if (errors.length > 0) {
      toast({ variant: 'destructive', title: 'Errores', description: `No se generó: ${errors.join(', ')}` });
    } else {
      toast({ title: 'Generación Completa', description: 'Todos los horarios han sido generados.' });
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
      toast({ variant: 'destructive', title: 'Faltan datos', description: 'Completa todos los campos de la materia.' });
    }
  };
  
  const handleExport = useCallback(() => {
    if (!scheduleRef.current) {
      toast({ variant: 'destructive', title: 'Nada que exportar', description: 'Genera un horario primero.' });
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
      .catch(() => toast({ variant: 'destructive', title: 'Error al exportar' }));
  }, [activeScheduleGroup, selectedTeacher, viewMode, toast]);

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
      toast({ variant: 'destructive', title: 'Datos incompletos' });
      return;
    }
    updateSubject(editingSubject.index, { ...editingSubject, name: subjectEditName, hours: parseInt(subjectEditHours), teacher: subjectEditTeacher });
    setIsSubjectEditDialogOpen(false);
    setEditingSubject(null);
    toast({ title: 'Materia Actualizada' });
  };

  const groups = Array.from(new Set(subjectFields.map(s => s.group))).sort();

  const teacherSchedules = useMemo(() => {
    const schedules: Record<string, ScheduleGeneratorOutput['schedule']> = {};
    for (const t of dbTeachers) {
      const ts: ScheduleGeneratorOutput['schedule'] = { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [] };
      for (const gs of Object.values(allGeneratedSchedules)) {
        for (const day of days) {
          const k = day as keyof typeof gs;
          gs[k]?.filter(s => s.teacher === t.name).forEach(s => ts[k].push(s));
        }
      }
      for (const day of days) ts[day as keyof typeof ts]?.sort((a, b) => a.time.localeCompare(b.time));
      schedules[t.name] = ts;
    }
    return schedules;
  }, [allGeneratedSchedules, dbTeachers]);

  const activeGroupSchedule = activeScheduleGroup ? allGeneratedSchedules[activeScheduleGroup] : null;
  const selectedTeacherSchedule = selectedTeacher ? teacherSchedules[selectedTeacher] : null;

  return (
    <div className="container py-10 space-y-8">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <CloudIcon className="h-6 w-6 text-primary" />
              Panel de Generación de Horarios
            </CardTitle>
            <CardDescription>Los docentes se gestionan en el módulo <Link href="/admin/docentes" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">Docentes <ExternalLink className="h-3 w-3"/></Link>. Aquí asigna materias y genera horarios.</CardDescription>
          </div>
          <Button variant="outline" asChild>
            <a href="/horarios" target="_blank">Ver Vista Pública</a>
          </Button>
        </CardHeader>
      </Card>

      {/* Docentes panel (read-only) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary"/>Docentes Activos ({dbTeachers.length})</CardTitle>
            <CardDescription>Cargados desde el directorio oficial. Para agregar o editar, usa el módulo de Docentes.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/docentes"><Users className="mr-2 h-4 w-4"/>Gestionar Docentes</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingDocentes ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/>Cargando docentes...</div>
          ) : dbTeachers.length === 0 ? (
            <div className="text-center py-4 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-amber-700 font-medium">No hay docentes activos registrados.</p>
              <Button variant="link" asChild className="text-amber-700"><Link href="/admin/docentes">Ir a registrar docentes →</Link></Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {dbTeachers.map(t => (
                <div key={t.id} className="flex items-center gap-2 p-2 bg-muted/40 rounded-lg text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"/>
                  <span className="truncate font-medium">{t.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Form {...form}>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle>1. Configurar Materias</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium text-sm">Añadir Materia</p>
                <div className="flex gap-4 items-end">
                  <div className="flex-1"><Label>Carrera</Label><Select value={selectedCareer} onValueChange={setSelectedCareer}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{careers.map(c => <SelectItem key={c.slug} value={c.slug}>{c.title}</SelectItem>)}</SelectContent></Select></div>
                  <div className="flex-1"><Label>Semestre</Label><Select value={selectedSemester} onValueChange={setSelectedSemester}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{semesters.map(s => <SelectItem key={s} value={s}>{s}° Semestre</SelectItem>)}</SelectContent></Select></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input placeholder="Nombre de materia" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} />
                  <Input type="number" placeholder="Horas/semana" value={newSubjectHours} onChange={e => setNewSubjectHours(e.target.value)} />
                  <Select value={newSubjectTeacher} onValueChange={setNewSubjectTeacher} disabled={isLoadingDocentes || dbTeachers.length === 0}>
                    <SelectTrigger><SelectValue placeholder={isLoadingDocentes ? "Cargando..." : dbTeachers.length === 0 ? "Sin docentes" : "Seleccionar Docente"}/></SelectTrigger>
                    <SelectContent>{dbTeachers.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={handleAddSubject} className="w-full sm:w-auto" disabled={dbTeachers.length === 0}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Materia</Button>
                <Separator className="my-6" />
                <p className="font-medium text-sm">Opciones Avanzadas</p>
                <div className="flex items-center space-x-2">
                  <Checkbox id="prioritize-core" checked={prioritizeCore} onCheckedChange={(c) => setPrioritizeCore(Boolean(c))} />
                  <Label htmlFor="prioritize-core" className="cursor-pointer text-sm font-normal">Priorizar materias de pensamiento y ciencias en primeras horas.</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="allow-long-blocks" checked={allowLongBlocks} onCheckedChange={(c) => setAllowLongBlocks(Boolean(c))}/>
                  <Label htmlFor="allow-long-blocks" className="cursor-pointer text-sm font-normal">Permitir bloques largos (hasta 5h) para materias de programación.</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <div>
                  <CardTitle>2. Grupos y Generación</CardTitle>
                  <CardDescription>Genera horarios por grupo.</CardDescription>
                </div>
                <Button type="button" onClick={handleGenerateAll} disabled={isGeneratingAll || dbTeachers.length === 0}>
                  {isGeneratingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                  Generar Todo
                </Button>
              </CardHeader>
              <CardContent>
                {groups.length > 0 ? (
                  <Accordion type="multiple" className="w-full" value={openAccordionGroup} onValueChange={setOpenAccordionGroup}>
                    {groups.map(group => {
                      const groupSubjects = subjectFields.filter(s => s.group === group);
                      return (
                        <AccordionItem value={group} key={group}>
                          <AccordionTrigger>{group} ({groupSubjects.length} materias)</AccordionTrigger>
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
                              );
                            })}
                            <Button type="button" className="w-full mt-4" onClick={() => handleGenerateForGroup(group)} disabled={generatingGroup === group || dbTeachers.length === 0}>
                              {generatingGroup === group ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Generando...</> : `Generar Horario`}
                            </Button>
                          </AccordionContent>
                        </AccordionItem>
                      );
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
                    <Download className="mr-2 h-4 w-4"/>Exportar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'group' | 'teacher')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="group">Vista por Grupo</TabsTrigger>
                    <TabsTrigger value="teacher">Vista por Docente</TabsTrigger>
                  </TabsList>
                  <TabsContent value="group" className="mt-4">
                    {generatingGroup && <div className="flex flex-col items-center justify-center h-full gap-4 pt-10"><Loader2 className="h-12 w-12 animate-spin text-primary"/><p className="text-muted-foreground">Generando horario para {generatingGroup}...</p></div>}
                    {!generatingGroup && !activeGroupSchedule && <div className="flex items-center justify-center h-full pt-20 text-center text-muted-foreground"><p>Genera un horario para verlo aquí.</p></div>}
                    {activeGroupSchedule && <ScheduleTable ref={scheduleRef} schedule={activeGroupSchedule} title="Horario de Clases" subtitle={activeScheduleGroup ?? undefined} detailKey="teacher"/>}
                  </TabsContent>
                  <TabsContent value="teacher" className="mt-4 space-y-4">
                    <Select onValueChange={setSelectedTeacher} value={selectedTeacher}>
                      <SelectTrigger><SelectValue placeholder="Selecciona un docente"/></SelectTrigger>
                      <SelectContent>{dbTeachers.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                    {!selectedTeacher && <div className="flex items-center justify-center h-full pt-20 text-center text-muted-foreground"><p>Selecciona un docente.</p></div>}
                    {selectedTeacher && selectedTeacherSchedule && <ScheduleTable ref={scheduleRef} schedule={selectedTeacherSchedule} title="Horario de Docente" subtitle={selectedTeacher} detailKey="group"/>}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </Form>

      <Dialog open={isSubjectEditDialogOpen} onOpenChange={setIsSubjectEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Materia</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Materia</Label><Input value={subjectEditName} onChange={(e) => setSubjectEditName(e.target.value)} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4"><Label className="text-right">Horas/Semana</Label><Input type="number" value={subjectEditHours} onChange={(e) => setSubjectEditHours(e.target.value)} className="col-span-3" /></div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Docente</Label>
              <Select value={subjectEditTeacher} onValueChange={setSubjectEditTeacher}>
                <SelectTrigger className="col-span-3"><SelectValue/></SelectTrigger>
                <SelectContent>{dbTeachers.map(t => <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsSubjectEditDialogOpen(false)} variant="outline">Cancelar</Button>
            <Button onClick={handleUpdateSubject}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


export default function AdminHorariosPage() {
  const [initialSubjects, setInitialSubjects] = useState<ScheduleFormValues['subjects'] | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = getCurrentUser((u) => {
      if (u) setUser(u);
      else router.push('/login');
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setInitialSubjects(parsed);
          return;
        }
      }
    } catch (e) {}
    setInitialSubjects([]);
  }, []);

  if (authLoading || !initialSubjects) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return <ScheduleAdminForm initialSubjects={initialSubjects} />;
}
