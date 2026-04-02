
import { Timestamp } from "firebase/firestore";

export interface Evento {
    id: string;
    title: string;
    description: string;
    date: string; // Using ISO string for serialization
    imageUrl?: string;
}
