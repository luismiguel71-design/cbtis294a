import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './client';

/**
 * Uploads a file to Firebase Storage and returns its download URL.
 * @param file The File object to upload.
 * @param path The storage path (e.g., 'news/image.jpg').
 * @returns The download URL.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
    if (!storage) {
        // Fallback for demo mode: Return a data URL (not real storage, but allows testing)
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });
    }
    
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("No se pudo subir la imagen.");
    }
}
