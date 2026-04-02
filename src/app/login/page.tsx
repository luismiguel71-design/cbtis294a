'use client';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation";
import { signInUser } from "@/lib/firebase/auth";
import { useState } from "react";
import { Loader2, AlertTriangle, Info } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Por favor, introduce un correo electrónico válido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
})

export default function LoginPage() {
  const { toast } = useToast()
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
 
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // Usamos signInUser que maneja tanto Firebase como el Modo Demo local
      await signInUser(values.email, values.password);
      
      toast({
        title: "Inicio de Sesión Exitoso",
        description: "Acceso concedido al panel administrativo.",
      });
      router.push('/admin/eventos');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error de Autenticación",
        description: "El correo o la contraseña son incorrectos o el servicio no está disponible.",
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-6">
      <Card className="w-full max-w-md mx-4 drop-shadow-xl">
        <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">CBTIS 294 Admin</CardTitle>
            <CardDescription>Acceso restringido para personal autorizado.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@cbtis294.edu.mx" {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input placeholder="******" {...field} type="password"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar al Sistema
                </Button>
              </form>
            </Form>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md mx-4 bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
            <div className="flex items-start gap-4">
                <Info className="h-6 w-6 text-primary mt-1 shrink-0" />
                <div className="text-sm">
                    <p className="font-bold mb-1">Credenciales de Prueba:</p>
                    <p className="text-muted-foreground"><span className="font-semibold select-all">admin@cbtis294.edu.mx</span></p>
                    <p className="text-muted-foreground"><span className="font-semibold select-all">cbtis294_2026_secure</span></p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  )
}
