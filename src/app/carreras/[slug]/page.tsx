import { notFound } from 'next/navigation';
import Image from 'next/image';
import { careers } from '@/app/lib/school-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CheckCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export async function generateStaticParams() {
  return careers.map((career) => ({
    slug: career.slug,
  }));
}

export default function CareerDetailPage({ params }: { params: { slug: string } }) {
  const career = careers.find((c) => c.slug === params.slug);

  if (!career) {
    notFound();
  }

  const careerImage = PlaceHolderImages.find((img) => img.id === career.image);

  return (
    <div>
      <section className="relative h-[40vh] w-full flex items-center justify-center text-center text-white">
        {careerImage && (
          <Image
            src={careerImage.imageUrl}
            alt={career.title}
            fill
            className="object-cover"
            priority
            data-ai-hint={careerImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 container px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            {career.title}
          </h1>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-primary mb-4">Descripción de la Carrera</h2>
            <p className="text-muted-foreground text-lg">{career.description}</p>
            
            <h2 className="text-2xl font-bold text-primary mt-12 mb-4">Perfil de Egreso</h2>
            <p className="text-muted-foreground text-lg">{career.graduateProfile}</p>
          </div>
          <div className="md:col-span-1">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary">Plan de Estudios</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {career.curriculum.map((module, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold">{module.title}</h4>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
