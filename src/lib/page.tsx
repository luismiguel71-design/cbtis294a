'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Edit2, Upload, X, IdCard, Search, Filter } from 'lucide-react';
import { uploadFile } from '@/lib/firebase/storage';
import { Alumno } from '@/lib/types';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/firebase/auth';
import { User } from 'firebase/auth';
import { isFirebaseConfigured } from '@/lib/firebase/client';
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

export default function AlumnosPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteAlumnoId, setDeleteAlumnoId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [filterGrado, setFilterGrado] = useState('');
  const [filterGrupo, setFilterGrupo] = useState('');

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

  const loadAlumnos = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAlumnos({
        nombre: searchTerm,
        carrera: filterCarrera,
        grado: filterGrado,
        grupo: filterGrupo,
      });
      setAlumnos(data);
    } catch (error) {
      console.error('[Alumnos] Error loading alumnos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los alumnos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterCarrera, filterGrado, filterGrupo, toast]);

  useEffect(() => {
    if (user) {
      loadAlumnos();
    }
  }, [user, loadAlumnos]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const downloadUrl = await uploadFile(file, `alumnos/${Date.now()}-${file.name}`);
      form.setValue('fotografia', downloadUrl);
      setPreviewImage(downloadUrl);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
      form.reset({ nombre: '', carrera: '', grado: '', grupo: '', fotografia: '' });
      setPreviewImage(null);
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: AlumnoFormValues) => {
    try {
      setIsLoading(true);
      const result = isEditing && editingId
        ? await updateAlumnoAction(editingId, values)
        : await addAlumnoAction(values);

      if (result.error) {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Éxito', description: result.success });
        setIsDialogOpen(false);
        loadAlumnos();
      }
    } catch (error: any) {
      toast({ title: 'Error', description: 'Error al procesar la solicitud.', variant: 'destructive' });
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
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      } else {
        toast({ title: 'Éxito', description: result.success });
        loadAlumnos();
      }
    } finally {
      setIsLoading(false);
      setDeleteAlumnoId(null);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <h2 className="text-xl font-bold text-blue-600 mt-4">Verificando acceso...</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <IdCard className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Gestión de Alumnos</h1>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="h-4 w-4" /> Agregar Alumno
        </Button>
      </div>

      <div className="mb-6 p-4 border rounded-lg bg-gray-50 flex flex-wrap items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por nombre..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select onValueChange={setFilterCarrera} value={filterCarrera}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Carrera" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las Carreras</SelectItem>
            {CARRERAS.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select onValueChange={setFilterGrado} value={filterGrado}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Grado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los Grados</SelectItem>
            {GRADOS.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={loadAlumnos} disabled={isLoading}><Filter className="h-4 w-4 mr-2" /> Filtrar</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {alumnos.map((alumno) => (
          <Card key={alumno.id} className="overflow-hidden hover:shadow-xl transition-all border-none group relative">
            <div className="bg-gradient-to-br from-[#335999] to-[#4AC4DC] p-5 text-white min-h-[200px]">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-black tracking-tighter">CBTIS 294</h3>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-white/20" onClick={() => handleOpenDialog(alumno)}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-red-500/50" onClick={() => setDeleteAlumnoId(alumno.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="relative w-20 h-24 bg-white/20 rounded border border-white/30 overflow-hidden flex-shrink-0">
                  {alumno.fotografia ? <Image src={alumno.fotografia} alt={alumno.nombre} fill className="object-cover" /> : <IdCard className="m-auto h-8 w-8 text-white/30" />}
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <p className="text-[7px] uppercase text-white/60 font-bold">Alumno</p>
                  <p className="font-bold text-sm truncate uppercase">{alumno.nombre}</p>
                  <p className="text-[7px] uppercase text-white/60 mt-2 font-bold">Especialidad</p>
                  <p className="text-[10px] truncate font-medium">{alumno.carrera}</p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-2 text-center text-xs">
                <div className="border-r border-white/10"><p className="opacity-60">Grado</p><b>{alumno.grado}°</b></div>
                <div><p className="opacity-60">Grupo</p><b>{alumno.grupo}</b></div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{isEditing ? 'Editar Alumno' : 'Nuevo Alumno'}</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="nombre" render={({ field }) => (
                  <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input placeholder="Nombre completo" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="carrera" render={({ field }) => (
                  <FormItem><FormLabel>Carrera</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                      <SelectContent>{CARRERAS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="grado" render={({ field }) => (
                  <FormItem><FormLabel>Grado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                      <SelectContent>{GRADOS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="grupo" render={({ field }) => (
                  <FormItem><FormLabel>Grupo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona" /></SelectTrigger></FormControl>
                      <SelectContent>{GRUPOS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
              </div>
              <div className="space-y-2">
                <FormLabel>Fotografía</FormLabel>
                {previewImage && (
                  <div className="relative w-24 h-32 mb-2"><Image src={previewImage} alt="Preview" fill className="object-cover rounded" />
                    <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => { setPreviewImage(null); form.setValue('fotografia', ''); }}><X className="h-3" /></Button>
                  </div>
                )}
                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin mr-2" /> : null} Guardar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteAlumnoId} onOpenChange={() => setDeleteAlumnoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Eliminar alumno?</AlertDialogTitle><AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}