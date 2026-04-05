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
      <section className="relative min-h-[70vh] md:min-h-[80vh] pb-16 md:pb-20 w-full flex items-center justify-center text-center text-white">
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
            Formación técnica con visión de futuro, enfocada en Inteligencia Artificial, análisis de datos y servicios profesionales.
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

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-primary-100">Aprendizaje activo</p>
              <p className="mt-4 text-lg font-semibold text-white">Proyectos prácticos con herramientas de IA reales.</p>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-primary-100">Alta empleabilidad</p>
              <p className="mt-4 text-lg font-semibold text-white">Carreras alineadas con las necesidades del mercado.</p>
            </div>
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-primary-100">Apoyo constante</p>
              <p className="mt-4 text-lg font-semibold text-white">Docentes y laboratorios que te acompañan en cada paso.</p>
            </div>
          </div>

          <div className="mt-12 w-full max-w-4xl mx-auto animate-fade-in-up">
            <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl bg-black">
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://player.cloudinary.com/embed/?cloud_name=dpqghsf3y&public_id=video_ki857x"
                title="Video de Inteligencia Artificial"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="mt-4 text-sm md:text-base text-white/80 text-center">
              Ve cómo se vive la carrera de IA en CBTIS 294 y conoce el impacto de nuestros programas.</p>
          </div>
        </div>
      </section>

      <section id="carreras" className="py-20 md:py-28 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Oferta Educativa
              </h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl">
                Conoce nuestras carreras técnicas con enfoque en tecnologías emergentes, datos y servicios, diseñadas para preparar a los estudiantes para el mundo laboral.
              </p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg">
              <p className="text-sm uppercase tracking-[0.3em] text-primary-600">Programa destacado</p>
              <h3 className="mt-4 text-2xl font-bold text-slate-900">Técnico en Inteligencia Artificial</h3>
              <p className="mt-3 text-slate-600">
                Desarrolla soluciones inteligentes y visualiza datos para transformar procesos y construir productos tecnológicos con impacto.
              </p>
              <Button asChild variant="secondary" className="mt-6">
                <Link href="/carreras/inteligencia-artificial">Ver detalles</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {careers.map((career) => {
              const careerImage = PlaceHolderImages.find((img) => img.id === career.image);
              return (
                <Card
                  key={career.id}
                  className="overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-2xl"
                >
                  {careerImage && (
                    <div className="relative h-52 w-full">
                      <Image
                        src={careerImage.imageUrl}
                        alt={career.title}
                        fill
                        className="object-cover"
                        data-ai-hint={careerImage.imageHint}
                      />
                    </div>
                  )}
                  <CardContent className="space-y-5 p-6">
                    <div>
                      <CardTitle className="text-primary">{career.title}</CardTitle>
                      <CardDescription className="mt-3 text-sm text-slate-600 line-clamp-4">
                        {career.description}
                      </CardDescription>
                    </div>
                    <div className="rounded-3xl bg-primary/5 p-4 text-sm text-slate-700">
                      <p className="font-semibold">Perfil de egreso</p>
                      <p className="mt-2 text-slate-600 line-clamp-3">{career.graduateProfile}</p>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/carreras/${career.slug}`}>
                        Ver carrera <ArrowRight className="ml-2" />
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
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-primary">
                  Nuestro Espíritu
                </h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                  El águila es nuestro símbolo de identidad: fuerza, visión estratégica y libertad para innovar. Representa el carácter del CBTIS 294 y el compromiso con el crecimiento académico y social de nuestros alumnos.
                </p>
              </div>
              <div className="grid gap-6 text-center lg:text-left lg:grid-cols-2">
                <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.3em] text-primary-100">Misión</p>
                  <p className="mt-3 text-base text-slate-100">Educar con excelencia técnica y formar estudiantes preparados para enfrentar retos reales.</p>
                </div>
                <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-xl backdrop-blur-xl">
                  <p className="text-sm uppercase tracking-[0.3em] text-primary-100">Identidad</p>
                  <p className="mt-3 text-base text-slate-100">Ser una comunidad de aprendizaje innovadora, responsable y con visión hacia el futuro.</p>
                </div>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[580px]">
              <div className="relative rounded-[2rem] overflow-hidden border border-white/20 bg-primary/10 shadow-2xl">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-slate-900/10" />
                <div className="absolute inset-6 rounded-[1.75rem] bg-white/10" />
                <div className="relative w-full h-[520px] p-6">
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
