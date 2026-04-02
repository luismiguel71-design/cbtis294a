import { getDocentes } from '@/lib/firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, GraduationCap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DocentesPage() {
  const docentes = await getDocentes();
  const activos = docentes.filter(d => d.status === 'activo');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/10 to-background border-b">
        <div className="container px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-black text-primary tracking-tighter mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Cuerpo Académico
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground leading-relaxed">
            Nuestros docentes son pilares de excelencia, dedicados a formar profesionistas competentes y éticos.
          </p>
        </div>
      </section>

      {/* Directory Section */}
      <section className="py-20">
        <div className="container px-4">
          {activos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {activos.map((docente) => (
                <Card 
                  key={docente.id} 
                  className="group relative overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/50 backdrop-blur-sm"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <Avatar className="w-32 h-32 mb-6 border-4 border-white shadow-xl ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-500">
                      <AvatarImage 
                        src={docente.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${docente.name}`} 
                        alt={docente.name} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary text-white">
                        <User className="w-16 h-16" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {docente.name}
                    </h3>
                    
                    <div className="space-y-3 w-full">
                      <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        <GraduationCap className="mr-2 h-4 w-4" />
                        {docente.specialty}
                      </div>
                      
                      <div className="flex items-center justify-center text-muted-foreground text-sm hover:text-primary transition-colors">
                        <Mail className="mr-2 h-4 w-4" />
                        <span className="truncate max-w-[200px]">{docente.email}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="max-w-md mx-auto text-center py-20">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-gray-400">Directorio en actualización</h2>
              <p className="text-muted-foreground mt-2">Próximamente podrás consultar aquí a todo nuestro equipo académico.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
