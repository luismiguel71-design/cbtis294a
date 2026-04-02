import { getEvent } from "@/lib/firebase/firestore";
import Image from "next/image";
import { notFound } from "next/navigation";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function NoticiaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.date);

  return (
    <div>
      <section className="relative h-[50vh] w-full flex items-center justify-center text-center text-white">
        {event.imageUrl && (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
            data-ai-hint="event image"
          />
        )}
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 container px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {event.title}
          </h1>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Publicado el {format(eventDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="prose prose-lg lg:prose-xl max-w-none text-muted-foreground">
              <p>{event.description}</p>
            </div>
        </div>
      </section>
    </div>
  );
}
