import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  BrainCircuit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { careers } from '@/app/lib/school-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getEvents } from '@/lib/firebase/firestore';
import { Evento } from '@/lib/types';
import mascot from '@/assets/images/mascot.png';

const heroImage = PlaceHolderImages.find((img) => img.id === 'hero-students-laughing');

export default async function Home() {
  const latestEvents = await getEvents(3);

  return (
    <div className="flex flex-col">
      <section className="relative h-[60vh] md:h-[70vh] w-full flex items-center justify-center text-center text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative z-10 container px-4 md:px-6 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 animate-fade-in-down">
            CBTIS No. 294
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-primary-foreground/90 mb-8 animate-fade-in-up">
            Formando líderes para el futuro tecnológico y de servicios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
            <Button asChild size="lg">
              <Link href="/carreras">
                Nuestra Oferta Educativa <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/admisiones">Proceso de Admisión</Link>
            </Button>
          </div>
          <div className="mt-10 w-full max-w-4xl mx-auto animate-fade-in-up">
            <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl">
              <iframe
                className="h-full w-full"
                src="https://www.youtube-nocookie.com/embed/2ePf9rue1Ao"
                title="Carrera en Inteligencia Artificial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="mt-4 text-sm md:text-base text-white/80">
              Descubre el potencial de la Inteligencia Artificial y cómo esta carrera abre puertas a oportunidades profesionales de alto impacto.
            </p>
          </div>
        </div>
      </section>

      <section id="carreras" className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              Oferta Educativa
            </h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora nuestras carreras técnicas diseñadas para el éxito
              profesional en industrias de alta demanda.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {careers.map((career) => {
              const careerImage = PlaceHolderImages.find((img) => img.id === career.image);
              return (
                <Card
                  key={career.id}
                  className="overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl"
                >
                  {careerImage && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={careerImage.imageUrl}
                        alt={career.title}
                        fill
                        className="object-cover"
                        data-ai-hint={careerImage.imageHint}
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-primary">{career.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="line-clamp-3">
                      {career.description}
                    </CardDescription>
                    <Button asChild variant="link" className="px-0 mt-4">
                      <Link href={`/carreras/${career.slug}`}>
                        Saber más <ArrowRight className="ml-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              Nuestro Espíritu
            </h2>
            <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
              Nuestra mascota, el águila, representa la visión, la fuerza y la libertad que inspiramos en nuestros estudiantes.
            </p>
          </div>
          <div className="flex justify-center">
             <div className="relative w-64 h-64 md:w-80 md:h-80">
                <Image
                    src={mascot}
                    alt="Mascota del CBTIS 294"
                    fill
                    className="object-contain"
                    data-ai-hint="school mascot eagle"
                />
             </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 md:py-24 bg-card">
        <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              Innovación y Futuro en CBTIS 294
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Nuestra misión es ofrecer educación de nivel medio superior técnico, formando estudiantes competentes y preparados para el sector laboral y la continuación de estudios superiores, con un enfoque especial en las tecnologías emergentes como la Inteligencia Artificial.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <GraduationCap />
                    </div>
                    <div>
                        <h3 className="font-semibold">Educación de Vanguardia</h3>
                        <p className="text-muted-foreground text-sm">Planes de estudio actualizados y relevantes para la industria 4.0.</p>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <Users />
                    </div>
                    <div>
                        <h3 className="font-semibold">Docentes Expertos</h3>
                        <p className="text-muted-foreground text-sm">Profesionales con experiencia en su campo y en tecnologías de punta.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <BrainCircuit />
                    </div>
                    <div>
                        <h3 className="font-semibold">Enfoque en IA</h3>
                        <p className="text-muted-foreground text-sm">Laboratorios y proyectos enfocados en Inteligencia Artificial.</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <ArrowRight />
                    </div>
                    <div>
                        <h3 className="font-semibold">Visión de Futuro</h3>
                        <p className="text-muted-foreground text-sm">Preparación para la universidad y los empleos del mañana.</p>
                    </div>
                </div>
            </div>
          </div>
          <div>
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
                <Image
                    src="https://picsum.photos/seed/ai-classroom/800/600"
                    alt="Aula con tecnología de IA"
                    fill
                    className="object-cover"
                    data-ai-hint="AI classroom technology"
                />
            </div>
          </div>
        </div>
      </section>

      <section id="noticias" className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              Últimas Noticias y Eventos
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Mantente al día con las novedades de nuestra comunidad escolar.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestEvents.map((evento: Evento) => (
              <Card key={evento.id} className="shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <CardHeader className='p-0'>
                  <div className="aspect-video bg-muted rounded-t-lg mb-4 overflow-hidden relative">
                    <Image
                        src={evento.imageUrl || `https://picsum.photos/seed/event${evento.id}/600/400`}
                        alt={evento.title}
                        fill
                        className="object-cover"
                        data-ai-hint="student event"
                    />
                  </div>
                </CardHeader>
                <CardContent className='p-6'>
                  <CardTitle className='text-xl'>{evento.title}</CardTitle>
                  <CardDescription className='mt-2 line-clamp-3'>
                    {evento.description}
                  </CardDescription>
                  <Button variant="link" className="px-0 mt-2">
                    <Link href={`/noticias/${evento.id}`}>Leer más</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
             {latestEvents.length === 0 && (
                <p className="text-center col-span-3 text-muted-foreground">No hay eventos recientes.</p>
            )}
          </div>
           <div className="text-center mt-12">
                <Button asChild>
                    <Link href="/noticias">Ver todas las noticias</Link>
                </Button>
            </div>
        </div>
      </section>
    </div>
  );
}
