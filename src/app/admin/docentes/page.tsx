'use client';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, UserPlus, Mail, Briefcase, Trash2, Edit2, Upload, X } from 'lucide-react';
import { uploadFile } from '@/lib/firebase/storage';
import { getDocentes } from '@/lib/firebase/firestore';
import { Docente } from '@/lib/types';
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
import { addDocenteAction, deleteDocenteAction, updateDocenteAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const docenteFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  specialty: z.string().min(3, 'La especialidad es requerida.'),
  email: z.string().email('Email inválido.'),
  imageUrl: z.string().url('URL de imagen inválida.').optional().or(z.literal('')),
  status: z.enum(['activo', 'inactivo']),
});

type DocenteFormValues = z.infer<typeof docenteFormSchema>;

export default function AdminDocentesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentDocente, setCurrentDocente] = useState<Docente | null>(null);
  const [docenteToDeleteId, setDocenteToDeleteId] = useState<string | null>(null);

  const form = useForm<DocenteFormValues>({
    resolver: zodResolver(docenteFormSchema),
    defaultValues: {
      name: '',
      specialty: '',
      email: '',
      imageUrl: '',
      status: 'activo',
    },
  });
  
  useEffect(() => {
    if (currentDocente) {
      form.reset({
        name: currentDocente.name,
        specialty: currentDocente.specialty,
        email: currentDocente.email,
        imageUrl: currentDocente.imageUrl || '',
        status: currentDocente.status,
      });
    } else {
      form.reset({
        name: '',
        specialty: '',
        email: '',
        imageUrl: '',
        status: 'activo',
      });
    }
  }, [currentDocente, form]);

  useEffect(() => {
    const unsubscribe = getCurrentUser((user) => {
      if (user) {
        setUser(user);
        fetchDocentes();
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchDocentes = async () => {
    const data = await getDocentes();
    setDocentes(data);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    try {
      const path = `teachers/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      form.setValue('imageUrl', url);
      toast({
        title: "Imagen cargada",
        description: "La fotografía del docente se ha subido correctamente.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de carga",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  async function onSubmit(data: DocenteFormValues) {
    setIsSubmitting(true);
    const result = currentDocente
      ? await updateDocenteAction(currentDocente.id, data)
      : await addDocenteAction(data);
    
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else {
      toast({
        title: `Docente ${currentDocente ? 'Actualizado' : 'Agregado'}`,
        description: `Los datos se han guardado correctamente.`,
      });
      setIsFormDialogOpen(false);
      fetchDocentes();
    }
    setIsSubmitting(false);
  }
  
  const handleOpenCreateDialog = () => {
    setCurrentDocente(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (docente: Docente) => {
    setCurrentDocente(docente);
    setIsFormDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!docenteToDeleteId) return;
    setIsSubmitting(true);
    const result = await deleteDocenteAction(docenteToDeleteId);
    if (result.error) {
      toast({ variant: "destructive", title: "Error", description: result.error });
    } else {
      toast({ title: "Eliminado", description: "Docente eliminado correctamente." });
      fetchDocentes();
    }
    setIsSubmitting(false);
    setIsDeleteDialogOpen(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="container py-10">
      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Directorio de Docentes
              </CardTitle>
              <p className="text-muted-foreground mt-1">Gestiona el personal académico y su disponibilidad.</p>
            </div>
            <Button onClick={handleOpenCreateDialog} className="shadow-lg hover:scale-105 transition-all">
              <UserPlus className="mr-2 h-4 w-4" /> Agregar Docente
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {docentes.map((docente) => (
              <Card key={docente.id} className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-none bg-white shadow-md">
                <div className="relative h-48 w-full bg-muted">
                  <Image
                    src={docente.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${docente.name}`}
                    alt={docente.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${
                    docente.status === 'activo' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {docente.status}
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 truncate">{docente.name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Briefcase className="mr-2 h-4 w-4 text-primary" />
                      {docente.specialty}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="mr-2 h-4 w-4 text-primary" />
                      {docente.email}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenEditDialog(docente)}>
                      <Edit2 className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => { setDocenteToDeleteId(docente.id); setIsDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {docentes.length === 0 && (
            <div className="text-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed">
              <Loader2 className="h-10 w-10 animate-spin mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-medium text-muted-foreground">Cargando directorio o sin docentes disponibles.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{currentDocente ? 'Editar Perfil Docente' : 'Nuevo Registro Docente'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl><Input placeholder="Ej. Dr. Juan Pérez" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidad</FormLabel>
                      <FormControl><Input placeholder="Matemáticas, IA..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Institucional</FormLabel>
                    <FormControl><Input type="email" placeholder="juan.perez@cbtis294.edu.mx" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fotografía del Docente</FormLabel>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <FormControl className="flex-1">
                          <Input placeholder="URL de la imagen (o sube una)" {...field} />
                        </FormControl>
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="teacher-image-upload"
                            onChange={handleFileChange}
                            disabled={isSubmitting}
                          />
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="icon" 
                            asChild
                            className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            <label htmlFor="teacher-image-upload" className="cursor-pointer">
                              <Upload className="h-4 w-4" />
                            </label>
                          </Button>
                        </div>
                      </div>
                      
                      {field.value && (
                        <div className="relative h-40 w-full rounded-lg overflow-hidden border bg-muted">
                          <Image 
                            src={field.value} 
                            alt="Previsualización" 
                            fill 
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={() => form.setValue('imageUrl', '')}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-6">
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg shadow-xl">
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Guardar Información'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará al docente del directorio oficial. No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
