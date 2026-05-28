'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2, UserCircle, Search, Filter, X, Upload } from 'lucide-react';
import { Alumno } from '@/lib/types';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/firebase/auth';
import { User } from 'firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { getAlumnos } from '@/lib/firebase/firestore';
import { uploadFile } from '@/lib/firebase/storage';
import { addAlumnoAction, updateAlumnoAction, deleteAlumnoAction } from '@/app/actions';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl,FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

export default function AlumnosCRUDPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('todas');
  
  // Estados para el CRUD
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteAlumnoId, setDeleteAlumnoId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      setIsLoading(true);
      const data = await getAlumnos();
      setAlumnos(data);
    } catch (error) {
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
          <UserCircle className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Gestión de Alumnos</h1>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Alumno
        </Button>
      </div>

      <div className="mb-8 p-4 bg-muted/30 rounded-xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nombre..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterCarrera} onValueChange={setFilterCarrera}>
          <SelectTrigger className="w-full md:w-[250px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Carrera" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las Carreras</SelectItem>
            {CARRERAS.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && alumnos.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : alumnos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCircle className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">No hay alumnos registrados.</p>
            <Button onClick={() => handleOpenDialog()}>Registrar primer alumno</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {alumnos
            .filter(a => a.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
            .filter(a => filterCarrera === 'todas' || a.carrera === filterCarrera)
            .map((alumno) => (
              <Card key={alumno.id} className="overflow-hidden hover:shadow-md transition-all">
                <div className="p-4 flex gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {alumno.fotografia ? (
                      <Image src={alumno.fotografia} alt={alumno.nombre} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <UserCircle className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold truncate">{alumno.nombre}</h3>
                    <p className="text-xs text-muted-foreground truncate">{alumno.carrera}</p>
                    <p className="text-xs font-medium text-blue-600">{alumno.grado}° {alumno.grupo}</p>
                  </div>
                </div>
                <div className="bg-muted/50 p-2 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(alumno)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleteAlumnoId(alumno.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
        </div>
      )}

      {/* Formulario Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Alumno' : 'Agregar Nuevo Alumno'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="nombre" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="carrera" render={({ field }) => (
                <FormItem>
                  <FormLabel>Carrera</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar carrera" /></SelectTrigger></FormControl>
                    <SelectContent>{CARRERAS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="grado" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semestre</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Grado" /></SelectTrigger></FormControl>
                      <SelectContent>{GRADOS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="grupo" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Grupo" /></SelectTrigger></FormControl>
                      <SelectContent>{GRUPOS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="space-y-2">
                <FormLabel>Fotografía</FormLabel>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted border">
                    {previewImage ? (
                      <>
                        <Image src={previewImage} alt="Preview" fill className="object-cover" />
                        <button type="button" onClick={() => { setPreviewImage(null); form.setValue('fotografia', ''); }} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X className="h-3 w-3" /></button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Upload className="h-6 w-6 text-muted-foreground" /></div>
                    )}
                  </div>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} className="flex-1" />
                </div>
                {uploadingImage && <p className="text-xs text-blue-600 animate-pulse">Subiendo imagen...</p>}
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isLoading || uploadingImage}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Guardar Cambios' : 'Crear Alumno'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Alerta de Eliminación */}
      <AlertDialog open={!!deleteAlumnoId} onOpenChange={() => setDeleteAlumnoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminarán permanentemente los datos del alumno.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
