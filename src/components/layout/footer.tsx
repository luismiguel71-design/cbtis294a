import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Logo } from './logo';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <Logo className="text-primary-foreground" />
          <p className="mt-4 text-sm text-primary-foreground/80">
            Formando líderes para el futuro tecnológico y de servicios.
          </p>
          <div className="flex space-x-4 mt-6">
            <Link href="#" className="text-primary-foreground/80 hover:text-white transition-colors">
              <Facebook className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-primary-foreground/80 hover:text-white transition-colors">
              <Twitter className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-primary-foreground/80 hover:text-white transition-colors">
              <Instagram className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-primary-foreground/80 hover:text-white transition-colors">
              <Youtube className="h-6 w-6" />
            </Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold tracking-wider uppercase">Navegación</h4>
          <ul className="mt-4 space-y-2">
            <li><Link href="/" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">Inicio</Link></li>
            <li><Link href="/carreras" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">Carreras</Link></li>
            <li><Link href="/admisiones" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">Admisiones</Link></li>
            <li><Link href="/docentes" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">Docentes</Link></li>
            <li><Link href="/contacto" className="text-sm text-primary-foreground/80 hover:text-white transition-colors">Contacto</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold tracking-wider uppercase">Contacto</h4>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
            <li className="flex items-start">
              <span>Dirección: Chimalhuacán, Estado de México</span>
            </li>
            <li className="flex items-start">
              <span>Email: contacto@cbtis294.edu.mx</span>
            </li>
            <li className="flex items-start">
             <span>Teléfono: (55) 1234-5678</span>
            </li>
          </ul>
        </div>
        <div>
            <h4 className="font-semibold tracking-wider uppercase">Boletín</h4>
            <p className="mt-4 text-sm text-primary-foreground/80">Suscríbete para recibir noticias y actualizaciones.</p>
            {/* Newsletter form can be added here */}
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 py-6">
        <div className="container px-4 md:px-6 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} CBTIS No. 294. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
