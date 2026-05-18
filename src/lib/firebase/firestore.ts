'use server';

import { adminDb } from './admin';
import type { Evento, Docente, Alumno } from '../types';

// Mock storage for demo purposes when Firebase is not configured using globalThis
const globalForFirebase = globalThis as unknown as { mockEvents: Evento[], mockSchedules: any[], mockDocentes: Docente[], mockAlumnos: Alumno[] };
if (!globalForFirebase.mockEvents) globalForFirebase.mockEvents = [];
if (!globalForFirebase.mockSchedules) globalForFirebase.mockSchedules = [];
if (!globalForFirebase.mockDocentes) globalForFirebase.mockDocentes = [];
if (!globalForFirebase.mockAlumnos) globalForFirebase.mockAlumnos = [];

export async function getEvents(count?: number): Promise<Evento[]> {
  if (!adminDb) {
    return count ? globalForFirebase.mockEvents.slice(0, count) : globalForFirebase.mockEvents;
  }
  try {
    let queryRef = adminDb.collection('events').orderBy('date', 'desc');
    if (count) queryRef = queryRef.limit(count) as any;

    const snapshot = await queryRef.get();
    if (snapshot.empty) return [];

    const events: Evento[] = [];
    snapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            // Los Timestamps del Admin SDK tienen un método toDate() similar
            date: data.date && typeof data.date.toDate === 'function' ? data.date.toDate().toISOString() : new Date().toISOString(),
            imageUrl: data.imageUrl,
        });
    });
    return events;
  } catch (error) {
    console.error("Error getting documents: ", error);
    return [];
  }
}

export async function getEvent(id: string): Promise<Evento | null> {
    if (!adminDb) return globalForFirebase.mockEvents.find(e => e.id === id) || null;
    try {
        const docSnap = await adminDb.collection('events').doc(id).get();
        if (docSnap.exists) {
            const data = docSnap.data()!;
            return {
                id: docSnap.id,
                title: data.title,
                description: data.description,
                date: data.date && typeof data.date.toDate === 'function' ? data.date.toDate().toISOString() : new Date().toISOString(),
                imageUrl: data.imageUrl,
            };
        } else return null;
    } catch (error) {
        console.error("Error getting document:", error);
        return null;
    }
}

export async function addEvent(data: { title: string; description: string; imageUrl: string; }) {
    if (!adminDb) {
        const newEvent: Evento = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
        };
        globalForFirebase.mockEvents = [newEvent, ...globalForFirebase.mockEvents];
        return;
    }
    try {
        await adminDb.collection('events').add({ ...data, date: new Date() });
    } catch (error) {
        console.error("Error adding document: ", error);
        throw new Error("No se pudo crear el evento.");
    }
}

export async function updateEvent(id: string, data: { title: string; description: string; imageUrl: string; }) {
    if (!adminDb) {
        globalForFirebase.mockEvents = globalForFirebase.mockEvents.map(e => e.id === id ? { ...e, ...data } : e);
        return;
    }
    try {
        await adminDb.collection('events').doc(id).update(data);
    } catch (error) {
        console.error("Error updating document: ", error);
        throw new Error("No se pudo actualizar el evento.");
    }
}

export async function deleteEvent(id: string) {
    if (!adminDb) {
        globalForFirebase.mockEvents = globalForFirebase.mockEvents.filter(e => e.id !== id);
        return;
    }
    try {
        await adminDb.collection('events').doc(id).delete();
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw new Error("No se pudo eliminar el evento.");
    }
}

export async function addSchedule(schedule: any) {
    if (!adminDb) {
        globalForFirebase.mockSchedules.push({ ...schedule, timestamp: Date.now() });
        return;
    }
    try {
        await adminDb.collection('schedules').add({ schedule, timestamp: new Date() });
    } catch (error) {
        console.error("Error adding schedule: ", error);
    }
}

export async function getLatestSchedule() {
    if (!adminDb) {
        return globalForFirebase.mockSchedules.length > 0 ? globalForFirebase.mockSchedules[globalForFirebase.mockSchedules.length - 1] : null;
    }
    try {
        const snapshot = await adminDb.collection('schedules').orderBy('timestamp', 'desc').limit(1).get();
        if (!snapshot.empty) return snapshot.docs[0].data();
        return null;
    } catch (error) {
        console.error("Error getting schedule: ", error);
        return null;
    }
}

// --- DOCENTES CRUD ---

export async function getDocentes(): Promise<Docente[]> {
    if (!adminDb) {
        return globalForFirebase.mockDocentes;
    }
    try {
        const snapshot = await adminDb.collection('docentes').get();
        const docentes: Docente[] = [];
        snapshot.forEach((doc) => {
            docentes.push({ id: doc.id, ...doc.data() } as Docente);
        });
        return docentes;
    } catch (error) {
        console.error("Error getting docentes:", error);
        return [];
    }
}

export async function addDocente(data: Omit<Docente, 'id'>) {
    if (!adminDb) {
        const newDocente: Docente = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
        };
        globalForFirebase.mockDocentes = [...globalForFirebase.mockDocentes, newDocente];
        return;
    }
    try {
        await adminDb.collection('docentes').add(data);
    } catch (error) {
        console.error("Error adding docente:", error);
        throw new Error("No se pudo agregar el docente.");
    }
}

export async function updateDocente(id: string, data: Partial<Docente>) {
    if (!adminDb) {
        globalForFirebase.mockDocentes = globalForFirebase.mockDocentes.map(d => d.id === id ? { ...d, ...data } : d);
        return;
    }
    try {
        await adminDb.collection('docentes').doc(id).update(data);
    } catch (error) {
        console.error("Error updating docente:", error);
        throw new Error("No se pudo actualizar el docente.");
    }
}

export async function deleteDocente(id: string) {
    if (!adminDb) {
        globalForFirebase.mockDocentes = globalForFirebase.mockDocentes.filter(d => d.id !== id);
        return;
    }
    try {
        await adminDb.collection('docentes').doc(id).delete();
    } catch (error) {
        console.error("Error deleting docente:", error);
        throw new Error("No se pudo eliminar el docente.");
    }
}

// --- ALUMNOS CRUD ---

export async function getAlumnos(): Promise<Alumno[]> {
    if (!adminDb) {
        return globalForFirebase.mockAlumnos;
    }
    try {
        const snapshot = await adminDb.collection('alumnos').get();
        return snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        } as Alumno));
    } catch (error) {
        console.error("Error getting alumnos:", error);
        return [];
    }
}

export async function addAlumno(data: Omit<Alumno, 'id'>) {
    if (!adminDb) {
        const newAlumno: Alumno = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
        };
        globalForFirebase.mockAlumnos = [...globalForFirebase.mockAlumnos, newAlumno];
        return newAlumno.id;
    }
    try {
        const docRef = await adminDb.collection('alumnos').add(data);
        return docRef.id;
    } catch (error) {
        console.error("[Firestore] Error adding alumno:", error);
        throw error;
    }
}

export async function updateAlumno(id: string, data: Partial<Alumno>) {
    if (!adminDb) {
        globalForFirebase.mockAlumnos = globalForFirebase.mockAlumnos.map(a => a.id === id ? { ...a, ...data } : a);
        return;
    }
    try {
        await adminDb.collection('alumnos').doc(id).update(data);
    } catch (error) {
        console.error("[Firestore] Error updating alumno:", error);
        throw error;
    }
}

export async function deleteAlumno(id: string) {
    if (!adminDb) {
        globalForFirebase.mockAlumnos = globalForFirebase.mockAlumnos.filter(a => a.id !== id);
        return;
    }
    try {
        await adminDb.collection('alumnos').doc(id).delete();
    } catch (error) {
        console.error("[Firestore] Error deleting alumno:", error);
        throw error;
    }
}
