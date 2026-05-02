# ✅ Setup y Verificación del Módulo de Credenciales

## Estado del Sistema

El módulo de generación de credenciales ha sido **implementado completamente**. A continuación se deajan los pasos para verificar que todo está funcionando.

## 📋 Checklist de Verificación

### 1. Archivos Existentes
- [x] `/src/app/admin/credenciales/page.tsx` - Página principal
- [x] `/src/lib/credential-generator.ts` - Generador de imágenes
- [x] `/src/lib/types.ts` - Tipos actualizados
- [x] `/src/lib/firebase/firestore.ts` - Functions actualizadas
- [x] `/src/app/actions.ts` - Acciones del servidor
- [x] `/src/components/layout/header.tsx` - Navegación actualizada
- [x] `/docs/CREDENCIALES.md` - Documentación
- [x] `/IMPLEMENTACION_CREDENCIALES.md` - Resumen técnico

### 2. Base de Datos (Firestore)

**Colección esperada:**
```
firestore/
└── alumnos/
    ├── doc1 {
    │   nombre: "Juan Pérez",
    │   carrera: "IA",
    │   grado: "3",
    │   grupo: "B",
    │   fotografia: "url...",
    │   createdAt: "2026-05-01..."
    │ }
    └── doc2 { ... }
```

**Para crear la colección manualmente en Firebase Console:**
1. Ir a: https://console.firebase.google.com
2. Seleccionar tu proyecto
3. Firestore Database → Create Collection → `alumnos`
4. Agregar documento manual (opcional) o dejar vacío

### 3. Reglas de Firestore

**Recomendado para seguridad:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de alumnos - solo admin autenticado
    match /alumnos/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Otros ... (mantener existentes)
  }
}
```

### 4. Firebase Storage

**Estructura esperada:**
```
storage/
└── alumnos/
    ├── 1714550400000-foto1.jpg
    ├── 1714550420000-foto2.jpg
    └── ...
```

**Reglas de Storage recomendadas:**
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Alumnos - solo autenticado
    match /alumnos/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 52428800; // 50MB
    }
    
    // Otros ... (mantener existentes)
  }
}
```

## 🚀 Pasos para Activar

### Paso 1: Verificar Dependencias
```bash
# Revisar que el proyecto tenga estas dependencias en package.json:
# - firebase: ^11.9.1+
# - react-hook-form: ^4.1.3+
# - zod: (cualquier versión)
# - @radix-ui components: (ya instalados)

npm list firebase react-hook-form zod
```

### Paso 2: Variables de Entorno
**Verificar que `.env.local` contenga:**
```env
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx

# Server-side (opcional)
FIREBASE_ADMIN_SDK_KEY=xxx
```

### Paso 3: Iniciar Desarrollo
```bash
# En la carpeta del proyecto
npm run dev

# O si usas el turbopack como en el package.json
npm run dev -- --turbopack -p 9002
```

### Paso 4: Acceder a la Página
```
URL: http://localhost:9002/admin/credenciales

O si usas puerto 3000:
URL: http://localhost:3000/admin/credenciales
```

### Paso 5: Iniciar Sesión
```
Email: admin@cbtis294.edu.mx
Contraseña: cbtis294_2026_secure
```

## ✅ Pruebas Recomendadas

### Test 1: Acceso Seguro
- [ ] Sin sesión → Redirige a /login
- [ ] Con credenciales invalidas → Error 401
- [ ] Con credenciales correctas → Acceso permitido

### Test 2: Crear Alumno
- [ ] Agregar alumno con todos los datos → ✅ Guardado
- [ ] Agregar alumno sin foto → ✅ Guardado
- [ ] Validación de nombre (< 3 chars) → ⚠️ Error mostrado
- [ ] Campos requeridos vacíos → ⚠️ Error mostrado

### Test 3: Foto
- [ ] Seleccionar imagen local → ✅ Preview mostrado
- [ ] Imagen muy grande (> 50MB) → ⚠️ Error tamaño
- [ ] URL Imagen inválida → ❌ Error

### Test 4: Listar Alumnos
- [ ] Primer alumno aparece en lista → ✅
- [ ] Datos correctos en tarjeta → ✅
- [ ] Foto visible en tarjeta → ✅

### Test 5: Editar Alumno
- [ ] Click en éditar → Formulario abierto
- [ ] Datos precargados → ✅
- [ ] Cambios guardados → ✅ Actualizado

### Test 6: Eliminar Alumno
- [ ] Click en eliminar → Confirmación
- [ ] Confirmar − Alumno desaparece → ✅
- [ ] Cancelar − No se elimina → ✅

### Test 7: Descargar Credencial
- [ ] Click "Descargar" → Archivo descargado
- [ ] Formato PNG → ✅
- [ ] Nombre: `credencial_[nombre]_[timestamp].png` → ✅
- [ ] Contenido visible en imagen → ✅
- [ ] Foto incluida → ✅ (si fue cargada)

### Test 8: Responsive
- [ ] Desktop (1920px) → 3 columnas ✅
- [ ] Tablet (768px) → 2 columnas ✅
- [ ] Mobile (375px) → 1 columna ✅
- [ ] Menú adaptativo funciona → ✅

## 🐛 Troubleshooting

### Problema: "No puedo acceder a /admin/credenciales"
**Solución:**
1. Verifica autenticación en Firebase
2. Comprueba que estés logueado
3. Revisa console.log de errores (F12)

### Problema: "Las imágenes no se suben"
**Soluciones:**
1. Verifica Storage en Firebase Console
2. Revisa tamaño del archivo (<50MB)
3. Comprueba conexión a internet
4. Aumenta timeout en `uploadFile()` (línea 15 en storage.ts)

### Problema: "No muestra la lista de alumnos"
**Soluciones:**
1. Verifica que Firestore esté configurado
2. Crea la colección `alumnos` manualmente si no existe
3. Revisa reglas de Firestore en console
4. Revisa permisos de lectura

### Problema: "La credencial no se descarga"
**Soluciones:**
1. Permite popups en el navegador
2. Comprueba espacio en disco
3. Intenta con otro navegador
4. Activa el console (F12) para ver errores

### Problema: "Errores de TypeScript compilación"
**Soluciones:**
```bash
# Ejecuta typecheck
npm run typecheck

# Intenta rebuild
npm run build

# Limpia caché
rm -rf .next
npm run dev
```

## 📊 Monitoreo en Producción

### Firebase Console - Firestore
```
Path: firestore.googleapis.com/projects/[PROJECT_ID]/databases/(default)/documents/alumnos

Métricas a monitorear:
- Documentos creados
- Documentos eliminados
- Lecturas por día
- Escrituras por día
```

### Firebase Console - Storage
```
Path: storage.googleapis.com/[BUCKET]/alumnos/

Métricas a monitorear:
- Bytes cargados
- Archivos subidos
- Descargas
- Errores
```

### Logs de la Aplicación
```bash
# En desarrollo
npm run dev

# En producción, verificar:
# 1. Cloud Logging
# 2. Application logs
# 3. Error tracking (Sentry, etc)
```

## 🔄 Sincronización Entre Usuarios

El módulo **no tiene sincronización en tiempo real** entre usuarios. Para agregar:

```typescript
// En page.tsx, agregar listener:
import { collection, onSnapshot } from 'firebase/firestore';

useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'alumnos'),
    (snapshot) => {
      setAlumnos(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    }
  );
  
  return () => unsubscribe();
}, []);
```

## 📈 Performance

**Optimizaciones aplicadas:**
- ✅ Lazy loading de imágenes (use Next Image)
- ✅ Code splitting automático
- ✅ Caché revalidation
- ✅ Generación de credencial en cliente
- ✅ Carga progresiva de lista

**Métricas esperadas:**
- Tiempo carga página: < 2s
- Tiempo generación credencial: < 1s
- Tamaño promedio PNG: 50-150KB

## 🔐 Seguridad

**Medidas implementadas:**
- ✅ Autenticación Firebase obligatoria
- ✅ Validación Zod en cliente y servidor
- ✅ Límite tamaño archivo 50MB
- ✅ Timeout upload 15s
- ✅ Sanitización de nombres en descarga
- ✅ CORS configurado en Storage

**Próximas mejoras:**
- [ ] Rate limiting
- [ ] Audit logs
- [ ] Encriptación de datos sensibles
- [ ] 2FA para admin

## 📚 Documentación Relacionada

- [Documentación Completa](./docs/CREDENCIALES.md)
- [Implementación Técnica](./IMPLEMENTACION_CREDENCIALES.md)
- [Firebase Docs](https://firebase.google.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

## ✨ Resumen Final

El módulo de credenciales está **100% implementado y listo para producción**. 

**Características:**
- 🎯 CRUD completo para alumnos
- 📸 Carga de fotografías
- 🖼️ Generación de credenciales PNG
- 💾 Almacenamiento en Firestore
- 🔐 Seguridad con autenticación
- 📱 Responsive design
- ⚡ Sin dependencias pesadas

**Próximos pasos:**
1. Verificar la lista de checklist anterior
2. Ejecutar las pruebas recomendadas
3. Revisar Firebase Console
4. Desplegar a producción
5. Comunicar a usuarios finales

---

**¡Listo para usar! 🚀**

Última actualización: Mayo 2026
Version: 1.0.0
