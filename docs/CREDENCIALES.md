# Módulo de Generación de Credenciales de Alumnos

## Descripción

Este módulo permite a los administradores del CBTIS 294 crear, gestionar y generar credenciales de alumnos en formato de imagen PNG descargable.

## Características

### ✨ Funcionalidades Principales

1. **Registro de Alumnos**: Formulario para agregar nuevos alumnos con:
   - Nombre completo
   - Carrera (Inteligencia Artificial, Inteligencia de Negocios, Urbanismo, Cosmetología)
   - Grado (1ro a 6to semestre)
   - Grupo (A, B, C, D)
   - Fotografía (carga desde dispositivo o URL)

2. **Gestión de Alumnos**:
   - Ver lista de todos los alumnos registrados
   - Editar información de alumnos existentes
   - Eliminar alumnos del sistema
   - Visualización en tarjetas con información resumida

3. **Generación de Credenciales**:
   - Descarga de credencial en formato PNG
   - Diseño profesional con:
     - Logo del CBTIS 294
     - Foto del alumno
     - Datos personales y académicos
     - ID único del alumno
     - Validez del ciclo escolar

4. **Almacenamiento en Base de Datos**:
   - Todos los datos se guardan automáticamente en Firebase Firestore
   - Las fotografías se almacenan en Firebase Storage
   - Soporte para modo offline con mock data

## Acceso

### Ubicación en la Aplicación
- **Ruta**: `/admin/credenciales`
- **Acceso**: Requiere autenticación de administrador
- **Navegación**: Disponible en el header principal bajo "Credenciales" (sección Admin)

### Credenciales de Demo
- Email: `admin@cbtis294.edu.mx`
- Contraseña: `cbtis294_2026_secure`

## Guía de Uso

### 1. Acceder al Módulo
1. Inicia sesión con credenciales de administrador
2. Haz clic en "Credenciales" en el header superior
3. Serás redirigido a la página del generador de credenciales

### 2. Agregar un Nuevo Alumno
1. Haz clic en el botón "Agregar Alumno" (esquina superior derecha)
2. Completa el formulario con los siguientes datos:
   - **Nombre del Alumno**: Ingresa el nombre completo
   - **Carrera**: Selecciona de la lista desplegable
   - **Grado**: Elige el semestre (1ro a 6to)
   - **Grupo**: Selecciona el grupo (A, B, C, D)
   - **Fotografía**: 
     - Haz clic en el campo de archivo para seleccionar una imagen
     - Se sube automáticamente a Firebase Storage
     - Puedes ver una vista previa antes de guardar
     - Para cambiar la foto, haz clic en la X de la vista previa
3. Haz clic en "Crear Alumno" para guardar

### 3. Editar un Alumno Existente
1. Haz clic en el botón de editar (ícono de lápiz) en la tarjeta del alumno
2. Modifica los datos necesarios
3. Sube una nueva foto si es requerido
4. Haz clic en "Actualizar" para guardar los cambios

### 4. Eliminar un Alumno
1. Haz clic en el botón de eliminar (ícono de basura roja) en la tarjeta del alumno
2. Confirma la eliminación en el cuadro de diálogo
3. El alumno será removido de la base de datos

### 5. Descargar Credencial
1. Haz clic en el botón "Descargar" en la tarjeta del alumno
2. Se generará una imagen PNG con la credencial
3. El archivo se descargará automáticamente con el nombre:
   - `credencial_[nombre_alumno]_[timestamp].png`
4. Puedes imprimir esta imagen o enviarla digitalmente

## Estructura de Datos

### Alumno (Firestore Document)
```typescript
interface Alumno {
  id: string;              // ID único en Firestore
  nombre: string;          // Nombre completo del alumno
  carrera: string;         // Carrera que cursa
  grado: string;          // Semestre/Grado (1-6)
  grupo: string;          // Grupo (A, B, C, D)
  fotografia?: string;    // URL de la fotografía en Storage
  createdAt: string;      // Fecha de creación (ISO string)
}
```

## Especificaciones de Descarga de Credencial

### Formato de Imagen
- **Tipo**: PNG (portable network graphics)
- **Resolución**: 600x400 píxeles
- **Modo Color**: RGBA

### Contenido de la Credencial
```
╔════════════════════════════════════════════════════════════════╗
║                      CBTIS 294                                 ║
║   Centro de Bachillerato Tecnológico Industrial y de Servicios ║
║                                                                ║
║  [FOTOGRAFÍA]     NOMBRE: [Nombre Completo]                   ║
║  [120x140px]      CARRERA: [Carrera]                           ║
║                   GRADO: [Grado]  GRUPO: [Grupo]              ║
║                                                                ║
║              ID: [ID_ÚNICO]                                   ║
║   Válida durante el ciclo escolar 2025-2026                  ║
╚════════════════════════════════════════════════════════════════╝
```

## Configuración Requerida

### Variables de Entorno
El módulo requiere que Firebase esté configurado correctamente:
- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

Ver `.env.local` para más detalles.

### Permisos en Firestore
Las reglas deben permitir:
```
- Lectura/Escritura en colección 'alumnos' para usuarios autenticados
- Lectura en colección 'alumnos' para usuarios públicos (opcional)
```

### Permisos en Storage
```
- Lectura/Escritura en ruta 'alumnos/' para usuarios autenticados
```

## Validaciones

El módulo incluye validaciones automáticas:

| Campo | Validación |
|-------|-----------|
| Nombre | Mínimo 3 caracteres |
| Carrera | Selección requerida |
| Grado | Selección requerida |
| Grupo | Selección requerida |
| Fotografía | URL válida (opcional) |

## Limitaciones y Consideraciones

1. **Tamaño de Archivo**: Las fotografías no deben exceder 50 MB
2. **Timeout de Carga**: Las cargas tienen un timeout de 15 segundos
3. **Base64 Fallback**: Si Firebase Storage no está disponible, las imágenes se codifican en base64 (límite 2 MB)
4. **Descarga de Credencial**: Se genera en PNG; para PDF, requeriría instalación de dependencias adicionales

## Errores Comunes

| Problema | Solución |
|---------|----------|
| Firebase no conectado | Verifica variables de entorno y conexión a internet |
| Imagen muy grande | Redimensiona la imagen antes de subirla (< 2 MB recomendado) |
| Carga lenta | Verifica velocidad de conexión de internet |
| No aparecen alumnos | Revisa permisos en Firestore |

## Futuras Mejoras

- [ ] Generación de PDF en lugar de PNG
- [ ] Impresión directa de credenciales en lotes
- [ ] Plantillas personalizables para credenciales
- [ ] Generación de códigos QR
- [ ] Historial de cambios
- [ ] Exportación en diferentes formatos
- [ ] Búsqueda y filtrado avanzado
- [ ] Importación en lote desde CSV

## Archivos del Módulo

```
src/
├── app/
│   ├── admin/
│   │   └── credenciales/
│   │       └── page.tsx              # Página principal del módulo
│   ├── actions.ts                    # Acciones de servidor (CRUD)
│   └── lib/
│       ├── types.ts                  # Interfaces (Alumno)
│       ├── credential-generator.ts   # Utilidad de generación de imágenes
│       └── firebase/
│           └── firestore.ts          # Funciones de Firestore para alumnos
└── components/
    └── layout/
        └── header.tsx                # Navegación actualizada
```

## Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contacta al equipo de desarrollo.

---

**Última actualización**: Mayo 2026
**Versión**: 1.0.0
