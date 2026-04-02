import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { teachers, careers } from '@/app/lib/school-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { User } from 'lucide-react';

export default function DocentesPage() {
  const teacherImage = PlaceHolderImages.find(img => img.id === 'teacher-placeholder');

  return (
    <div className="">
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            Nuestros Docentes
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            Conoce a nuestro equipo de profesionales dedicados, expertos en su campo y comprometidos con la formación de la próxima generación.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 space-y-16">
          {careers.map((career) => (
            <div key={career.id}>
              <h2 className="text-3xl font-bold text-primary mb-8 border-b-2 border-primary/20 pb-2">
                {career.title}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {teachers
                  .filter((teacher) => teacher.careerId === career.id)
                  .map((teacher, index) => (
                    <Card key={index} className="text-center transform hover:-translate-y-2 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-xl">
                      <CardContent className="pt-6 flex flex-col items-center">
                        <Avatar className="w-24 h-24 mb-4 border-4 border-muted">
                          {teacherImage ? (
                            <AvatarImage src={`https://picsum.photos/seed/teacher${career.id}${index}/200/200`} alt={teacher.name} data-ai-hint="professional portrait" />
                          ) : null}
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <User className="w-12 h-12" />
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-lg font-semibold text-primary">{teacher.name}</h3>
                        <p className="text-sm text-muted-foreground">{teacher.specialty}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
