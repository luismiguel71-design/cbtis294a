import { admissionInfo } from '@/app/lib/school-data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from 'next/image';

export default function AdmisionesPage() {
  return (
    <div className="">
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            Alumnos y Admisiones
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            Todo lo que necesitas saber para unirte a nuestra comunidad estudiantil y aprovechar al máximo tu experiencia en el CBTIS 294.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 grid md:grid-cols-2 gap-12 items-start">
            <div className='md:sticky md:top-24'>
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
                    <Image
                        src="https://picsum.photos/seed/students-studying/600/800"
                        alt="Estudiantes en el CBTIS 294"
                        fill
                        className="object-cover"
                        data-ai-hint="students studying"
                    />
                </div>
            </div>
            <div>
              <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                {admissionInfo.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg font-semibold text-primary hover:no-underline">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground">
                      {item.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
        </div>
      </section>
    </div>
  );
}
