'use server';

import { collection, query, orderBy, limit, getDocs, getDoc, doc, addDoc, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './client';
import type { Evento, Docente } from '../types';

// Mock storage for demo purposes when Firebase is not configured using globalThis
const globalForFirebase = globalThis as unknown as { mockEvents: Evento[], mockSchedules: any[], mockDocentes: Docente[] };
if (!globalForFirebase.mockEvents) globalForFirebase.mockEvents = [];
if (!globalForFirebase.mockSchedules) globalForFirebase.mockSchedules = [];
if (!globalForFirebase.mockDocentes) globalForFirebase.mockDocentes = [];

export async function getEvents(count?: number): Promise<Evento[]> {
  if (!db) {
    return count ? globalForFirebase.mockEvents.slice(0, count) : globalForFirebase.mockEvents;
  }
  try {
    const eventsCollection = collection(db, 'events');
    const q = count 
      ? query(eventsCollection, orderBy('date', 'desc'), limit(count))
      : query(eventsCollection, orderBy('date', 'desc'));

    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];

    const events: Evento[] = [];
    snapshot.forEach((doc) => {
        const data = doc.data();
        events.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : new Date().toISOString(),
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
    if (!db) return globalForFirebase.mockEvents.find(e => e.id === id) || null;
    try {
        const docRef = doc(db, 'events', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                title: data.title,
                description: data.description,
                date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : new Date().toISOString(),
                imageUrl: data.imageUrl,
            };
        } else return null;
    } catch (error) {
        console.error("Error getting document:", error);
        return null;
    }
}

export async function addEvent(data: { title: string; description: string; imageUrl: string; }) {
    if (!db) {
        const newEvent: Evento = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
        };
        globalForFirebase.mockEvents = [newEvent, ...globalForFirebase.mockEvents];
        return;
    }
    try {
        await addDoc(collection(db, 'events'), { ...data, date: Timestamp.now() });
    } catch (error) {
        console.error("Error adding document: ", error);
        throw new Error("No se pudo crear el evento.");
    }
}

export async function updateEvent(id: string, data: { title: string; description: string; imageUrl: string; }) {
    if (!db) {
        globalForFirebase.mockEvents = globalForFirebase.mockEvents.map(e => e.id === id ? { ...e, ...data } : e);
        return;
    }
    try {
        await updateDoc(doc(db, 'events', id), data);
    } catch (error) {
        console.error("Error updating document: ", error);
        throw new Error("No se pudo actualizar el evento.");
    }
}

export async function deleteEvent(id: string) {
    if (!db) {
        globalForFirebase.mockEvents = globalForFirebase.mockEvents.filter(e => e.id !== id);
        return;
    }
    try {
        await deleteDoc(doc(db, 'events', id));
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw new Error("No se pudo eliminar el evento.");
    }
}

export async function addSchedule(schedule: any) {
    if (!db) {
        globalForFirebase.mockSchedules.push({ ...schedule, timestamp: Date.now() });
        return;
    }
    try {
        await addDoc(collection(db, 'schedules'), { schedule, timestamp: Timestamp.now() });
    } catch (error) {
        console.error("Error adding schedule: ", error);
    }
}

export async function getLatestSchedule() {
    if (!db) {
        return globalForFirebase.mockSchedules.length > 0 ? globalForFirebase.mockSchedules[globalForFirebase.mockSchedules.length - 1] : null;
    }
    try {
        const q = query(collection(db, 'schedules'), orderBy('timestamp', 'desc'), limit(1));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) return snapshot.docs[0].data();
        return null;
    } catch (error) {
        console.error("Error getting schedule: ", error);
        return null;
    }
}

// --- DOCENTES CRUD ---

export async function getDocentes(): Promise<Docente[]> {
    if (!db) {
        return globalForFirebase.mockDocentes;
    }
    try {
        const snapshot = await getDocs(collection(db, 'docentes'));
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
    if (!db) {
        const newDocente: Docente = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
        };
        globalForFirebase.mockDocentes = [...globalForFirebase.mockDocentes, newDocente];
        return;
    }
    try {
        await addDoc(collection(db, 'docentes'), data);
    } catch (error) {
        console.error("Error adding docente:", error);
        throw new Error("No se pudo agregar el docente.");
    }
}

export async function updateDocente(id: string, data: Partial<Docente>) {
    if (!db) {
        globalForFirebase.mockDocentes = globalForFirebase.mockDocentes.map(d => d.id === id ? { ...d, ...data } : d);
        return;
    }
    try {
        await updateDoc(doc(db, 'docentes', id), data);
    } catch (error) {
        console.error("Error updating docente:", error);
        throw new Error("No se pudo actualizar el docente.");
    }
}

export async function deleteDocente(id: string) {
    if (!db) {
        globalForFirebase.mockDocentes = globalForFirebase.mockDocentes.filter(d => d.id !== id);
        return;
    }
    try {
        await deleteDoc(doc(db, 'docentes', id));
    } catch (error) {
        console.error("Error deleting docente:", error);
        throw new Error("No se pudo eliminar el docente.");
    }
}
