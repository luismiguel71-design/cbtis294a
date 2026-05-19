'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Download, Trash2, Edit2, Upload, X, IdCard } from 'lucide-react';
import { uploadFile } from '@/lib/firebase/storage';
import { Alumno } from '@/lib/types';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/firebase/auth';
import { User } from 'firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import {
import { useToast } from '@/hooks/use-toast';
import { getAlumnos } from '@/lib/firebase/firestore';
import { downloadCredential } from '@/lib/credential-generator';

const CARRERAS = [
  { value: 'Inteligencia Artificial', label: 'Inteligencia Artificial' },
  { value: 'Inteligencia de Negocios', label: 'Inteligencia de Negocios' },
  { value: 'Urbanismo', label: 'Urbanismo' },
  { value: 'Cosmetología', label: 'Cosmetología' },
];

const GRADOS = [
  { value: '1', label: '1er Semestre' },
  { value: '2', label: '2do Semestre' },
  { value: '3', label: '3er Semestre' },
  { value: '4', label: '4to Semestre' },
  { value: '5', label: '5to Semestre' },
  { value: '6', label: '6to Semestre' },
];

const GRUPOS = [
  { value: 'A', label: 'Grupo A' },
  { value: 'B', label: 'Grupo B' },
  { value: 'C', label: 'Grupo C' },
  { value: 'D', label: 'Grupo D' },
];

export default function CredencialesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = getCurrentUser((user) => {
      if (user) {
        setUser(user);
        loadAlumnos();
      } else {
        router.push('/login');
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadAlumnos = async () => {
    try {
      console.log('[Credenciales] Cargando alumnos...');
      setIsLoading(true);
      const data = await getAlumnos();
      console.log('[Credenciales] Alumnos obtenidos:', data);
      setAlumnos(data);
    } catch (error) {
      console.error('[Credenciales] Error loading alumnos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los alumnos.',
        variant: 'destructive',
      });
    } finally {
      console.log('[Credenciales] Terminó carga de alumnos, setIsLoading(false)');
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const downloadUrl = await uploadFile(file, `alumnos/${Date.now()}-${file.name}`);
      form.setValue('fotografia', downloadUrl);
      setPreviewImage(downloadUrl);
      toast({
        title: 'Éxito',
        description: 'Imagen cargada correctamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar la imagen.',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleOpenDialog = (alumno?: Alumno) => {
    if (alumno) {
      setIsEditing(true);
      setEditingId(alumno.id);
      form.reset({
        nombre: alumno.nombre,
        carrera: alumno.carrera,
        grado: alumno.grado,
        grupo: alumno.grupo,
        fotografia: alumno.fotografia || '',
      });
      setPreviewImage(alumno.fotografia || null);
    } else {
      setIsEditing(false);
      setEditingId(null);
      form.reset();
      setPreviewImage(null);
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: AlumnoFormValues) => {
    try {
      setIsLoading(true);
      if (isEditing && editingId) {
        const result = await updateAlumnoAction(editingId, values);
        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Éxito',
            description: result.success,
          });
          setIsDialogOpen(false);
          await loadAlumnos();
        }
      } else {
        const result = await addAlumnoAction(values);
        if (result.error) {
          toast({
            title: 'Error',
            description: result.error,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Éxito',
            description: result.success,
          });
          setIsDialogOpen(false);
          await loadAlumnos();
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al procesar la solicitud.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAlumnoId) return;
    try {
      setIsLoading(true);
      const result = await deleteAlumnoAction(deleteAlumnoId);
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Éxito',
          description: result.success,
        });
        await loadAlumnos();
      }
    } finally {
      setIsLoading(false);
      setDeleteAlumnoId(null);
    }
  };

  const generateCredentialPDF = async (alumno: Alumno) => {
    try {
      await downloadCredential({
        id: alumno.id,
        nombre: alumno.nombre,
        carrera: alumno.carrera,
        grado: alumno.grado,
        grupo: alumno.grupo,
        fotografia: alumno.fotografia,
      });
      toast({
        title: 'Éxito',
        description: 'Credencial descargada correctamente.',
      });
    } catch (error) {
      console.error('Error generating credential:', error);
      toast({
        title: 'Error',
        description: 'Error al generar la credencial. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <div className="mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-red-600 mb-2">[VISUAL LOG] Error de configuración de Firebase</h2>
        <p className="text-gray-700">No se detectó la configuración de Firebase.<br />
        Verifica que todas las variables de entorno de Firebase estén definidas en Vercel y vuelve a desplegar la aplicación.</p>
      </div>
    );
  }
  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <h2 className="text-xl font-bold text-blue-600 mt-4">[VISUAL LOG] Esperando autenticación...</h2>
      </div>
    );
  }
  if (isLoading && alumnos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <h2 className="text-xl font-bold text-blue-600 mt-4">[VISUAL LOG] Cargando alumnos...</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <IdCard className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Generador de Credenciales</h1>
        </div>
      </div>

      {isLoading && alumnos.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : alumnos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IdCard className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">No hay alumnos registrados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {alumnos.map((alumno) => (
            <Card key={alumno.id} className="overflow-hidden hover:shadow-xl transition-all border-none group relative">
              <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5 text-white min-h-[220px]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-sm font-black tracking-tighter">CBTIS 294</h3>
                    <p className="text-[8px] opacity-80 leading-none uppercase tracking-widest">Bachillerato Tecnológico</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="relative w-20 h-24 bg-white/20 rounded border border-white/30 overflow-hidden flex-shrink-0 shadow-inner">
                    {alumno.fotografia ? (
                      <Image
                        src={alumno.fotografia}
                        alt={alumno.nombre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <IdCard className="h-8 w-8 text-white/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <div className="mb-2">
                      <p className="text-[7px] uppercase tracking-[0.2em] text-white/60 mb-0.5 font-bold">Alumno</p>
                      <p className="font-bold text-sm truncate leading-tight uppercase">{alumno.nombre}</p>
                    </div>
                    <div>
                      <p className="text-[7px] uppercase tracking-[0.2em] text-white/60 mb-0.5 font-bold">Especialidad</p>
                      <p className="text-[10px] truncate font-medium">{alumno.carrera}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 text-center">
                  <div className="border-r border-white/10">
                    <p className="text-[7px] uppercase text-white/60 tracking-wider">Semestre</p>
                    <p className="text-xs font-bold">{alumno.grado}°</p>
                  </div>
                  <div>
                    <p className="text-[7px] uppercase text-white/60 tracking-wider">Grupo</p>
                    <p className="text-xs font-bold">{alumno.grupo}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white">
                <Button
                  className="w-full bg-[#764ba2] hover:bg-[#667eea] text-white shadow-sm transition-colors"
                  size="sm"
                  onClick={() => generateCredentialPDF(alumno)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Credencial PNG
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
