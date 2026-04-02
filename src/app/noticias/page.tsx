import { getEvents } from "@/lib/firebase/firestore";
import type { Evento } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function NoticiasPage() {
  const events = await getEvents();

  return (
    <div className="">
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            Noticias y Eventos
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            Mantente al día con las últimas novedades, anuncios y eventos de la
            comunidad del CBTIS 294.
          </p>
        </div>
      </section>
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((evento: Evento) => (
                <Card
                  key={evento.id}
                  className="shadow-lg transform hover:-translate-y-2 transition-transform duration-300"
                >
                  <CardHeader className="p-0">
                    <div className="aspect-video bg-muted rounded-t-lg mb-4 overflow-hidden relative">
                      <Image
                        src={
                          evento.imageUrl ||
                          `https://picsum.photos/seed/event${evento.id}/600/400`
                        }
                        alt={evento.title}
                        fill
                        className="object-cover"
                        data-ai-hint="student event"
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <CardTitle className="text-xl">{evento.title}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-3">
                      {evento.description}
                    </CardDescription>
                    <Button variant="link" className="px-0 mt-2">
                      <Link href={`/noticias/${evento.id}`}>Leer más</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No hay noticias o eventos para mostrar en este momento.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
