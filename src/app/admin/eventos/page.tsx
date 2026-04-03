'use client';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { getEvents } from '@/lib/firebase/firestore';
import { Evento } from '@/lib/types';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getCurrentUser } from '@/lib/firebase/auth';
import { uploadFile } from '@/lib/firebase/storage';
import { Camera, Image as ImageIcon, Link as LinkIcon, Trash2, Edit2, Plus, Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addEventAction, deleteEventAction, updateEventAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_EVENT_IMAGE = 'https://picsum.photos/seed/cbtis-evento/800/400';

const eventFormSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  imageUrl: z.string().url('URL inválida.').optional().or(z.literal('')),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

export default function AdminEventosPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Evento[]>([]);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Evento | null>(null);
  const [eventToDeleteId, setEventToDeleteId] = useState<string | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
    },
  });
  
  useEffect(() => {
    if (currentEvent) {
      form.reset({
        title: currentEvent.title,
        description: currentEvent.description,
        imageUrl: currentEvent.imageUrl,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        imageUrl: '',
      });
    }
  }, [currentEvent, form]);

  useEffect(() => {
    const unsubscribe = getCurrentUser((user) => {
      if (user) {
        setUser(user);
        fetchEvents();
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchEvents = async () => {
    const eventsFromDb = await getEvents();
    setEvents(eventsFromDb);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Archivo demasiado grande",
        description: "El límite es 1MB.",
      });
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Formato no soportado",
        description: "Solo se permiten imágenes JPG o PNG.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const path = `events/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      form.setValue('imageUrl', url);
      toast({
        title: "Imagen cargada",
        description: "La fotografía se ha subido correctamente.",
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

  async function onSubmit(data: EventFormValues) {
    setIsSubmitting(true);
    
    // Use default image if none provided
    const payload = {
      ...data,
      imageUrl: data.imageUrl || DEFAULT_EVENT_IMAGE,
    };

    try {
      const result = currentEvent
        ? await updateEventAction({ id: currentEvent.id, ...payload })
        : await addEventAction(payload);
      
      if (result.error) {
        toast({
          variant: "destructive",
          title: `Error al ${currentEvent ? 'actualizar' : 'crear'} evento`,
          description: result.error,
        });
      } else {
        toast({
          title: `Evento ${currentEvent ? 'Actualizado' : 'Creado'}`,
          description: `El evento se ha ${currentEvent ? 'actualizado' : 'guardado'} correctamente.`,
        });
        setIsFormDialogOpen(false);
        form.reset();
        setCurrentEvent(null);
        await fetchEvents();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: error?.message || "No se pudo completar la operación.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }
  
  const handleOpenCreateDialog = () => {
    setCurrentEvent(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (event: Evento) => {
    setCurrentEvent(event);
    setIsFormDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (id: string) => {
    setEventToDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDeleteId) return;

    setIsSubmitting(true);
    const result = await deleteEventAction(eventToDeleteId);
    
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar evento",
        description: result.error,
      });
    } else {
      toast({
        title: "Evento Eliminado",
        description: "El evento se ha eliminado correctamente.",
      });
      await fetchEvents();
    }
    setIsSubmitting(false);
    setIsDeleteDialogOpen(false);
    setEventToDeleteId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // The redirect is handled in the effect
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestionar Noticias y Eventos</CardTitle>
            <Button onClick={handleOpenCreateDialog}>Crear Nuevo Evento</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={
                      event.imageUrl ||
                      `https://picsum.photos/seed/event${event.id}/100/100`
                    }
                    alt={event.title}
                    width={80}
                    height={80}
                    className="rounded-md object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.date), "d 'de' MMMM 'de' yyyy", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditDialog(event)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleOpenDeleteDialog(event.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {events.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">
              No hay eventos para mostrar. ¡Crea el primero!
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Form Dialog for Create/Edit */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentEvent ? 'Editar Evento' : 'Crear Nuevo Evento'}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título del evento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe el evento"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagen del Evento</FormLabel>
                      <p className="text-sm text-muted-foreground">Límite de tamaño: 1MB. Formatos permitidos: JPG, PNG.</p>
                      <div className="space-y-3">
                        <div className="flex gap-2">
                           <FormControl className="flex-1">
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <div className="relative">
                            <Input
                              type="file"
                              accept=".jpg,.jpeg,.png"
                              className="hidden"
                              id="event-image-upload"
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
                              <label htmlFor="event-image-upload" className="cursor-pointer">
                                <Upload className="h-4 w-4" />
                              </label>
                            </Button>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">Pega una URL o sube un archivo directamente.</p>
                        
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
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentEvent ? 'Guardar Cambios' : 'Guardar Evento'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres eliminar este evento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El evento será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
