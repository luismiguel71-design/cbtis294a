
import { Timestamp } from "firebase/firestore";

export interface Evento {
    id: string;
    title: string;
    description: string;
    date: string; // Using ISO string for serialization
    imageUrl?: string;
}

export interface Docente {
    id: string;
    name: string;
    specialty: string;
    email: string;
    imageUrl?: string;
    status: 'activo' | 'inactivo';
}

export interface Alumno {
    id: string;
    nombre: string;
    carrera: string;
    grado: string;
    grupo: string;
    fotografia?: string;
    createdAt: string;
}
