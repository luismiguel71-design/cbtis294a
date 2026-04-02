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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Por favor, introduce un correo electrónico válido."),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
})

export default function ContactoPage() {
    const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })
 
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
        title: "Mensaje Enviado",
        description: "Gracias por contactarnos. Te responderemos pronto.",
    })
    form.reset();
  }

  return (
    <div className="">
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            Contáctanos
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            ¿Tienes alguna pregunta? Estamos aquí para ayudarte. Rellena el formulario o utiliza nuestros datos de contacto.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2 space-y-8">
                <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full text-primary"><MapPin /></div>
                        <div>
                            <h3 className="font-semibold text-lg">Dirección</h3>
                            <p className="text-muted-foreground">Chimalhuacán, Estado de México</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full text-primary"><Phone /></div>
                        <div>
                            <h3 className="font-semibold text-lg">Teléfono</h3>
                            <p className="text-muted-foreground">(55) 1234-5678</p>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full text-primary"><Mail /></div>
                        <div>
                            <h3 className="font-semibold text-lg">Email</h3>
                            <p className="text-muted-foreground">contacto@cbtis294.edu.mx</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-3">
            <Card className="p-8 shadow-lg">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl>
                                <Input placeholder="Tu nombre" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Correo Electrónico</FormLabel>
                            <FormControl>
                                <Input placeholder="tu@correo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Mensaje</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Escribe tu consulta aquí..." {...field} className="min-h-[150px]" />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" size="lg">Enviar Mensaje</Button>
                    </form>
                </Form>
                </Card>
            </div>
        </div>
      </section>
    </div>
  )
}
