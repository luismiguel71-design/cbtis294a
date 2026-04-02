'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Calendar } from 'lucide-react';
import { getLatestScheduleAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { ScheduleGeneratorOutput } from '@/ai/flows/schedule-generator-flow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const timeSlots = ["07:00-08:00", "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00", "14:00-15:00"];
const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

function ScheduleTable({ schedule, title, subtitle, detailKey }: { schedule: ScheduleGeneratorOutput['schedule'], title: string, subtitle?: string, detailKey: 'teacher' | 'group' }) {
    return (
        <div className="bg-white p-4 rounded-lg text-black overflow-x-auto shadow-sm border">
            <h2 className="text-xl font-bold text-center mb-1">{title}</h2>
            {subtitle && <h3 className="text-lg font-semibold text-center mb-4 text-primary">{subtitle}</h3>}
            <div className="min-w-[800px] grid grid-cols-6 border border-gray-300">
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
                                        <div className="space-y-1">
                                            <p className="font-bold text-gray-900 leading-tight">{slotData.subject}</p>
                                            <p className="text-gray-500 font-medium">{slotData[detailKey]}</p>
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
}

export default function HorariosPublicPage() {
  const [latestScheduleGroup, setLatestScheduleGroup] = useState<ScheduleGeneratorOutput['schedule'] | null>(null);
  const [allSchedules, setAllSchedules] = useState<Record<string, ScheduleGeneratorOutput['schedule']>>({});
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [viewMode, setViewMode] = useState<'group' | 'teacher'>('group');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const result = await getLatestScheduleAction();
        if (result.schedule) {
            // Assuming the last generation saved multiple groups or at least one
            // result.schedule is the object { Lunes: [], ... }
            // Let's check how we saved it. 
            // result.schedule is output.schedule from flow.
            
            // Wait, we need to adapt to how multiple groups are handled.
            // For now, let's assume it's one group or handle the structure.
            setLatestScheduleGroup(result.schedule);
            
            // Infer groups from schedule
            const groups = new Set<string>();
            Object.values(result.schedule).flat().forEach(slot => groups.add(slot.group));
            setSelectedGroup(Array.from(groups)[0] || '');
        }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar el horario.' });
      } finally {
        setLoading(false);
      }
    }
    fetchSchedules();
  }, [toast]);

  const teacherSchedules = useMemo(() => {
    if (!latestScheduleGroup) return {};
    const schedules: Record<string, ScheduleGeneratorOutput['schedule']> = {};
    const teachers = new Set<string>();
    Object.values(latestScheduleGroup).flat().forEach(slot => teachers.add(slot.teacher));

    for (const teacherName of Array.from(teachers)) {
        const teacherSched: ScheduleGeneratorOutput['schedule'] = { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [] };
        for (const day of days) {
            const dayKey = day as keyof typeof latestScheduleGroup;
            const slotsForTeacher = latestScheduleGroup[dayKey]?.filter(slot => slot.teacher === teacherName);
            if (slotsForTeacher) teacherSched[dayKey].push(...slotsForTeacher);
        }
        schedules[teacherName] = teacherSched;
    }
    return schedules;
  }, [latestScheduleGroup]);

  const groupSchedules = useMemo(() => {
    if (!latestScheduleGroup) return {};
    const schedules: Record<string, ScheduleGeneratorOutput['schedule']> = {};
    const groups = new Set<string>();
    Object.values(latestScheduleGroup).flat().forEach(slot => groups.add(slot.group));

    for (const groupName of Array.from(groups)) {
        const groupSched: ScheduleGeneratorOutput['schedule'] = { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [] };
        for (const day of days) {
            const dayKey = day as keyof typeof latestScheduleGroup;
            const slotsForGroup = latestScheduleGroup[dayKey]?.filter(slot => slot.group === groupName);
            if (slotsForGroup) groupSched[dayKey].push(...slotsForGroup);
        }
        schedules[groupName] = groupSched;
    }
    return schedules;
  }, [latestScheduleGroup]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!latestScheduleGroup) {
    return (
      <div className="container py-20 text-center">
        <Calendar className="h-20 w-20 mx-auto text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-bold mb-2">No hay horarios publicados aún</h1>
        <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
          El personal administrativo está trabajando en la planeación del próximo ciclo escolar. 
          Vuelve pronto para consultar tu horario.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-primary">Consulta de Horarios</h1>
            <p className="text-muted-foreground">Consulta las clases y docentes asignados para este semestre.</p>
        </div>
      </div>

      <Card className="shadow-lg border-primary/10">
        <CardHeader className="bg-primary/5 border-b">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <TabsList className="bg-background border">
                    <TabsTrigger value="group">Por Grupo / Semestre</TabsTrigger>
                    <TabsTrigger value="teacher">Por Docente</TabsTrigger>
                </TabsList>
                
                {viewMode === 'group' ? (
                  <div className="w-full sm:w-72">
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Seleccionar Grupo"/></SelectTrigger>
                        <SelectContent>
                            {Object.keys(groupSchedules).sort().map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="w-full sm:w-72">
                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                        <SelectTrigger className="bg-background"><SelectValue placeholder="Seleccionar Docente"/></SelectTrigger>
                        <SelectContent>
                            {Object.keys(teacherSchedules).sort().map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                  </div>
                )}
            </div>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-8">
           {viewMode === 'group' && selectedGroup && (
             <ScheduleTable 
                schedule={groupSchedules[selectedGroup]} 
                title="Horario de Clases" 
                subtitle={selectedGroup} 
                detailKey="teacher" 
            />
           )}
           {viewMode === 'teacher' && selectedTeacher && (
             <ScheduleTable 
                schedule={teacherSchedules[selectedTeacher]} 
                title="Horario de Docente" 
                subtitle={selectedTeacher} 
                detailKey="group" 
            />
           )}
           {(!selectedGroup && viewMode === 'group') || (!selectedTeacher && viewMode === 'teacher') ? (
               <div className="text-center py-20 bg-muted/20 rounded-lg border border-dashed">
                   <p className="text-muted-foreground uppercase tracking-widest font-semibold">Selecciona una opción del menú superior</p>
               </div>
           ) : null}
        </CardContent>
      </Card>
      
      <div className="bg-accent/30 p-6 rounded-xl flex items-center gap-4 border border-accent">
          <div className="bg-primary/20 p-3 rounded-full"><Calendar className="h-6 w-6 text-primary"/></div>
          <div>
              <p className="font-bold text-lg">¿Tienes dudas sobre tu horario?</p>
              <p className="text-sm text-muted-foreground">Acude al área de control escolar en horario administrativo (7:00 - 15:00 hrs) o utiliza nuestro asistente virtual.</p>
          </div>
      </div>
    </div>
  );
}
