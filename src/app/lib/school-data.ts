
export type Career = {
  id: string;
  slug: string;
  title: string;
  description: string;
  graduateProfile: string;
  curriculum: {
    title: string;
    description: string;
  }[];
  image: string;
};

export const careers: Career[] = [
  {
    id: "ia",
    slug: "inteligencia-artificial",
    title: "Técnico en Inteligencia Artificial",
    description: "Prepara a los estudiantes en el desarrollo, implementación y mantenimiento de sistemas basados en inteligencia artificial, abarcando áreas como machine learning, procesamiento de lenguaje natural y visión por computadora.",
    graduateProfile: "Capacitado para trabajar en desarrollo de software inteligente, análisis de datos, automatización de procesos, y como soporte en proyectos de innovación tecnológica.",
    curriculum: [
      { title: "Módulo 1: Fundamentos de Programación", description: "Introducción a la lógica de programación y lenguajes como Python." },
      { title: "Módulo 2: Matemáticas para IA", description: "Álgebra lineal, cálculo y estadística enfocada a modelos de IA." },
      { title: "Módulo 3: Machine Learning", description: "Estudio de algoritmos supervisados, no supervisados y de refuerzo." },
      { title: "Módulo 4: Redes Neuronales y Deep Learning", description: "Creación y entrenamiento de redes neuronales profundas." },
      { title: "Módulo 5: Proyectos de IA", description: "Desarrollo de un proyecto final aplicando los conocimientos adquiridos." },
    ],
    image: "career-ia"
  },
  {
    id: "business",
    slug: "inteligencia-de-negocios",
    title: "Técnico en Inteligencia de Negocios",
    description: "Forma profesionales capaces de analizar grandes volúmenes de datos para extraer información valiosa que apoye la toma de decisiones estratégicas en organizaciones, utilizando herramientas de análisis de datos y visualización.",
    graduateProfile: "Habilidades en manejo de bases de datos, creación de dashboards, reportes empresariales, y consultoría para optimizar el rendimiento de negocios.",
    curriculum: [
      { title: "Módulo 1: Fundamentos de Bases de Datos", description: "Modelado y consulta de bases de datos relacionales y NoSQL." },
      { title: "Módulo 2: Herramientas de BI", description: "Uso de plataformas como Tableau, Power BI para visualización de datos." },
      { title: "Módulo 3: ETL y Data Warehousing", description: "Procesos de extracción, transformación y carga de datos." },
      { title: "Módulo 4: Análisis Estadístico", description: "Aplicación de métodos estadísticos para la interpretación de datos." },
      { title: "Módulo 5: Proyecto de Business Intelligence", description: "Implementación de una solución de BI para un caso de negocio." },
    ],
    image: "career-business"
  },
  {
    id: "urbanism",
    slug: "urbanismo",
    title: "Técnico en Urbanismo",
    description: "Capacita en la planificación, diseño y gestión de espacios urbanos, considerando aspectos sociales, económicos y ambientales para crear ciudades sostenibles y funcionales. Incluye conocimientos de cartografía, normativas urbanas y proyectos de infraestructura.",
    graduateProfile: "Puede participar en oficinas de desarrollo urbano, proyectos de vivienda, gestión territorial, y como auxiliar en estudios de impacto ambiental.",
    curriculum: [
      { title: "Módulo 1: Introducción al Urbanismo", description: "Historia y teorías del desarrollo urbano." },
      { title: "Módulo 2: Dibujo Técnico y Cartografía", description: "Uso de software CAD y GIS para representación de planos." },
      { title: "Módulo 3: Legislación y Normativa Urbana", description: "Estudio de las leyes que rigen el desarrollo de las ciudades." },
      { title: "Módulo 4: Diseño Urbano Sostenible", description: "Principios de diseño para ciudades ecológicas y resilientes." },
      { title: "Módulo 5: Proyecto de Intervención Urbana", description: "Desarrollo de una propuesta para mejorar un espacio urbano." },
    ],
    image: "career-urbanism"
  },
  {
    id: "cosmetology",
    slug: "cosmetologia",
    title: "Técnico en Cosmetología",
    description: "Ofrece formación integral en tratamientos estéticos faciales y corporales, cuidado de la piel, técnicas de maquillaje, y gestión de servicios de belleza, con un enfoque en la salud y bienestar.",
    graduateProfile: "Apto para trabajar en salones de belleza, spas, clínicas estéticas, asesoría de imagen, o emprender su propio negocio en el sector de la belleza.",
    curriculum: [
      { title: "Módulo 1: Dermatología y Química Cosmética", description: "Fundamentos científicos del cuidado de la piel y productos." },
      { title: "Módulo 2: Tratamientos Faciales", description: "Técnicas de limpieza, exfoliación, hidratación y anti-envejecimiento." },
      { title: "Módulo 3: Tratamientos Corporales", description: "Masajes, exfoliaciones y envolturas corporales." },
      { title: "Módulo 4: Maquillaje Profesional", description: "Técnicas de maquillaje social, de noche y de fantasía." },
      { title: "Módulo 5: Gestión de un Spa/Salón", description: "Administración, marketing y atención al cliente en negocios de belleza." },
    ],
    image: "career-cosmetology"
  },
];

export const teachers = [
  { name: 'Dr. Alejandro Vargas', specialty: 'Inteligencia Artificial, Machine Learning', careerId: 'ia' },
  { name: 'Ing. Sofía Reyes', specialty: 'Procesamiento de Lenguaje Natural', careerId: 'ia' },
  { name: 'M.C. Ricardo Morales', specialty: 'Visión por Computadora', careerId: 'ia' },
  { name: 'Lic. Gabriela Castillo', specialty: 'Business Intelligence, Data Analytics', careerId: 'business' },
  { name: 'C.P. Fernando Núñez', specialty: 'Visualización de Datos, Power BI', careerId: 'business' },
  { name: 'Ing. Laura Méndez', specialty: 'ETL y Data Warehousing', careerId: 'business' },
  { name: 'Arq. Mónica Salazar', specialty: 'Diseño Urbano, Sostenibilidad', careerId: 'urbanism' },
  { name: 'Lic. Javier Pineda', specialty: 'Legislación Urbana y Territorial', careerId: 'urbanism' },
  { name: 'Geog. Roberto Fuentes', specialty: 'Sistemas de Información Geográfica (GIS)', careerId: 'urbanism' },
  { name: 'Dra. Isabela Corona', specialty: 'Dermatología Cosmética', careerId: 'cosmetology' },
  { name: 'Cosm. Patricia Gil', specialty: 'Tratamientos Faciales y Corporales', careerId: 'cosmetology' },
  { name: 'Est. Brenda Zúñiga', specialty: 'Maquillaje Profesional y de Caracterización', careerId: 'cosmetology' },
];

export const admissionInfo = [
  {
    title: "Proceso de Admisión",
    content: "El proceso suele abrirse anualmente, con convocatorias publicadas en el sitio web oficial y redes sociales de la escuela. Generalmente incluye un examen de conocimientos, presentación de documentos (acta de nacimiento, certificado de secundaria, CURP, etc.) y un curso propedéutico. Se recomienda a los interesados estar atentos a la sección de 'Admisiones' del sitio para fechas y requisitos específicos."
  },
  {
    title: "Becas y Apoyos",
    content: "Contamos con diversos programas de becas para apoyar a nuestros estudiantes. La información sobre los tipos de becas, requisitos y procesos de solicitud se publica al inicio de cada semestre en los canales oficiales de la escuela."
  },
  {
    title: "Actividades Extracurriculares",
    content: "Fomentamos el desarrollo integral de nuestros alumnos a través de talleres deportivos, culturales y artísticos. La oferta incluye equipos de fútbol, baloncesto, talleres de danza, música y teatro, entre otros."
  },
  {
    title: "Servicio Social y Prácticas Profesionales",
    content: "Ofrecemos oportunidades para que los estudiantes apliquen sus conocimientos en entornos laborales reales, obteniendo experiencia valiosa a través de nuestros programas de servicio social y prácticas profesionales, con convenios en diversas empresas."
  },
  {
    title: "Orientación Educativa",
    content: "El departamento de orientación educativa brinda apoyo psicopedagógico a los estudiantes, ayudándolos en su desarrollo académico, personal y vocacional a lo largo de su estancia en el bachillerato."
  }
];

    