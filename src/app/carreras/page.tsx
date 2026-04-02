import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
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

export default function CarrerasPage() {
  return (
    <div className="">
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            Nuestra Oferta Educativa
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            Descubre las carreras técnicas que te prepararán para los desafíos del mañana. En CBTIS 294, combinamos teoría y práctica para formar profesionales competentes.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {careers.map((career) => {
              const careerImage = PlaceHolderImages.find((img) => img.id === career.image);
              return (
                <Card
                  key={career.id}
                  className="group flex flex-col md:flex-row items-center overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  {careerImage && (
                    <div className="relative h-56 w-full md:w-2/5 flex-shrink-0">
                      <Image
                        src={careerImage.imageUrl}
                        alt={career.title}
                        fill
                        className="object-cover"
                        data-ai-hint={careerImage.imageHint}
                      />
                    </div>
                  )}
                  <div className="p-6 flex flex-col justify-between h-full">
                    <div>
                      <CardTitle className="text-xl text-primary">{career.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-3">
                        {career.description}
                      </CardDescription>
                    </div>
                    <Button asChild variant="default" className="mt-4 self-start">
                      <Link href={`/carreras/${career.slug}`}>
                        Ver Detalles <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
