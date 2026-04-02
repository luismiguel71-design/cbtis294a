'use server';

import { collection, query, orderBy, limit, getDocs, getDoc, doc, addDoc, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './client';
import type { Evento } from '../types';

// Mock storage for demo purposes when Firebase is not configured
// Since this is a 'use server' file, this will persist in the server's memory
// across multiple server action calls from the same client.
let mockEvents: Evento[] = [];

export async function getEvents(count?: number): Promise<Evento[]> {
  if (!db) {
    // Return mock events if no DB
    return count ? mockEvents.slice(0, count) : mockEvents;
  }
  try {
    const eventsCollection = collection(db, 'events');
    const q = count 
      ? query(eventsCollection, orderBy('date', 'desc'), limit(count))
      : query(eventsCollection, orderBy('date', 'desc'));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

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
    if (!db) {
        return mockEvents.find(e => e.id === id) || null;
    }
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
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error getting document:", error);
        return null;
    }
}


export async function addEvent(data: { title: string; description: string; imageUrl: string; }) {
    if (!db) {
        // Support mock adding for demo
        const newEvent: Evento = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toISOString(),
        };
        mockEvents = [newEvent, ...mockEvents];
        return;
    }
    try {
        const eventsCollection = collection(db, 'events');
        await addDoc(eventsCollection, {
            ...data,
            date: Timestamp.now(),
        });
    } catch (error) {
        console.error("Error adding document: ", error);
        throw new Error("No se pudo crear el evento.");
    }
}

export async function updateEvent(id: string, data: { title: string; description: string; imageUrl: string; }) {
    if (!db) {
        mockEvents = mockEvents.map(e => e.id === id ? { ...e, ...data } : e);
        return;
    }
    try {
        const eventDoc = doc(db, 'events', id);
        await updateDoc(eventDoc, data);
    } catch (error) {
        console.error("Error updating document: ", error);
        throw new Error("No se pudo actualizar el evento.");
    }
}

export async function deleteEvent(id: string) {
    if (!db) {
        mockEvents = mockEvents.filter(e => e.id !== id);
        return;
    }
    try {
        const eventDoc = doc(db, 'events', id);
        await deleteDoc(eventDoc);
    } catch (error) {
        console.error("Error deleting document: ", error);
        throw new Error("No se pudo eliminar el evento.");
    }
}

// Add schedules also to server memory if no DB
let mockSchedules: any[] = [];
export async function addSchedule(schedule: any) {
    if (!db) {
        mockSchedules.push({ ...schedule, timestamp: Date.now() });
        return;
    }
    try {
        await addDoc(collection(db, 'schedules'), {
            schedule,
            timestamp: Timestamp.now()
        });
    } catch (error) {
        console.error("Error adding schedule: ", error);
    }
}

export async function getLatestSchedule() {
    if (!db) {
        return mockSchedules.length > 0 ? mockSchedules[mockSchedules.length - 1] : null;
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
