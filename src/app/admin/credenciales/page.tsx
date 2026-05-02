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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addAlumnoAction, deleteAlumnoAction, updateAlumnoAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { getAlumnos } from '@/lib/firebase/firestore';
import { downloadCredential } from '@/lib/credential-generator';

const alumnoFormSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  carrera: z.string().min(1, 'La carrera es requerida.'),
  grado: z.string().min(1, 'El grado es requerido.'),
  grupo: z.string().min(1, 'El grupo es requerido.'),
  fotografia: z.string().optional(),
});

type AlumnoFormValues = z.infer<typeof alumnoFormSchema>;

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
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteAlumnoId, setDeleteAlumnoId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<AlumnoFormValues>({
    resolver: zodResolver(alumnoFormSchema),
    defaultValues: {
      nombre: '',
      carrera: '',
      grado: '',
      grupo: '',
      fotografia: '',
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
      } else {
        setIsAuthenticated(true);
        loadAlumnos();
      }
    };
    checkAuth();
  }, [router]);

  const loadAlumnos = async () => {
    try {
      setIsLoading(true);
      const data = await getAlumnos();
      setAlumnos(data);
    } catch (error) {
      console.error('Error loading alumnos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los alumnos.',
        variant: 'destructive',
      });
    } finally {
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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
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
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Alumno
        </Button>
      </div>

      {isLoading && alumnos.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : alumnos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IdCard className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">No hay alumnos registrados</p>
            <Button onClick={() => handleOpenDialog()} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Crear el primero
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {alumnos.map((alumno) => (
            <Card key={alumno.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {alumno.fotografia && (
                  <div className="mb-4 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={alumno.fotografia}
                      alt={alumno.nombre}
                      className="w-full h-full object-cover"
                      width={200}
                      height={160}
                    />
                  </div>
                )}
                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Nombre</p>
                    <p className="font-bold text-sm">{alumno.nombre}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Carrera</p>
                    <p className="text-sm">{alumno.carrera}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Grado</p>
                      <p className="text-sm font-semibold">{alumno.grado}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Grupo</p>
                      <p className="text-sm font-semibold">{alumno.grupo}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1"
                    onClick={() => generateCredentialPDF(alumno)}
                  >
                    <Download className="h-3 w-3" />
                    Descargar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenDialog(alumno)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteAlumnoId(alumno.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Alumno' : 'Agregar Nuevo Alumno'}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Alumno</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez García" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carrera"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carrera</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una carrera" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CARRERAS.map((carrera) => (
                            <SelectItem key={carrera.value} value={carrera.value}>
                              {carrera.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un grado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GRADOS.map((grado) => (
                            <SelectItem key={grado.value} value={grado.value}>
                              {grado.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="grupo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grupo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un grupo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {GRUPOS.map((grupo) => (
                            <SelectItem key={grupo.value} value={grupo.value}>
                              {grupo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <FormLabel>Fotografía del Alumno</FormLabel>
                <div className="mt-2 space-y-4">
                  {previewImage && (
                    <div className="relative w-32 h-40 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        width={128}
                        height={160}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          form.setValue('fotografia', '');
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="flex-1"
                    />
                    {uploadingImage && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Sube una fotografía del alumno (recomendado: formato retrato)
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    isEditing ? 'Actualizar' : 'Crear Alumno'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteAlumnoId} onOpenChange={() => setDeleteAlumnoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Alumno</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este alumno? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
