import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './client';

const UPLOAD_TIMEOUT_MS = 15000; // 15 seconds max

/**
 * Converts a file to a base64 data URL (works always, no server needed).
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Error leyendo el archivo.'));
        reader.readAsDataURL(file);
    });
}

/**
 * Uploads a file. Uses Firebase Storage if available, otherwise falls back to base64.
 * Has a timeout to prevent hanging.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
    // Validate file size (max 2MB to keep Firestore happy with base64 fallback)
    const MAX_SIZE_MB = 2;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        throw new Error(`La imagen no debe superar ${MAX_SIZE_MB}MB. Usa una URL externa para imágenes más grandes.`);
    }

    if (!storage) {
        // No Firebase Storage configured — use base64
        return fileToBase64(file);
    }

    // Try Firebase Storage with a timeout
    const uploadPromise = async () => {
        const storageRef = ref(storage!, path);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    };

    const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('La subida tardó demasiado. Intenta con una URL externa.')), UPLOAD_TIMEOUT_MS)
    );

    try {
        return await Promise.race([uploadPromise(), timeoutPromise]);
    } catch (error: any) {
        console.warn('Firebase Storage falló, usando base64:', error.message);
        // Fallback to base64 if Firebase Storage fails
        return fileToBase64(file);
    }
}
