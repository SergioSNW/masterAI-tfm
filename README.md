# MasterAI Casting Platform

> Trabajo Final de Máster (TFM) — Máster en Desarrollo con IA
> Plataforma multiplataforma de casting: un panel web para directores de casting y una app móvil para actores, sobre un único backend serverless.

🌐 **Proyecto desplegado:** [master-ai-tfm.vercel.app](https://master-ai-tfm.vercel.app)
📊 **Presentación (slides):** _pendiente de publicar — enlace al final de este README_
📘 **Referencia de arquitectura completa:** [ARCHITECTURE_TEXTBOOK.md](./ARCHITECTURE_TEXTBOOK.md) (en inglés)
🇬🇧 **English version of this README:** [README.en.md](./README.en.md)

---

## Índice

1. [Descripción general](#1-descripción-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Instalación y ejecución](#3-instalación-y-ejecución)
4. [Estructura del proyecto](#4-estructura-del-proyecto)
5. [Funcionalidades cubiertas](#5-funcionalidades-cubiertas)
6. [Proyecto desplegado](#6-proyecto-desplegado)
7. [Pruebas](#7-pruebas)
8. [Presentación](#8-presentación)

---

## 1. Descripción general

Los procesos de casting siguen dependiendo de cadenas de correos, carpetas compartidas y hojas de cálculo: el director recibe vídeos por canales dispersos, los compara a mano y pierde el rastro de quién ha enviado qué y en qué fase está cada candidato.

**MasterAI Casting Platform** digitaliza ese flujo de principio a fin:

1. El **director** crea un proyecto (p. ej. «The Crown — Season 3»), define los papeles (castings) y abre rondas de audición con fecha límite.
2. El **actor** consulta los castings abiertos, graba un _self-tape_ (en la app móvil, con la cámara del teléfono, o subiendo un archivo desde la web) y lo envía.
3. El director revisa los envíos: visualiza el vídeo, lee una **transcripción y una puntuación generadas por IA** (Whisper + GPT-4o-mini), deja comentarios y feedback, y marca al candidato como revisado, preseleccionado o rechazado. El actor ve el estado y el feedback de su envío.

Son dos clientes que comparten una única API y una única base de datos:

| Cliente | Público | Tecnología |
|---|---|---|
| **Panel web** | Directores de casting (y portal web para actores) | React 19 + Vite, desplegado en Vercel |
| **App móvil** | Actores | React Native + Expo (SDK 54), Android/iOS/web desde el mismo código |

El backend está construido con **Arquitectura Limpia** (Entities → Use Cases → Repository Interfaces → Adapters): la lógica de negocio vive en un paquete TypeScript sin dependencias externas, y Prisma, Zod, Vercel, Cloudinary y OpenAI quedan aislados en capas exteriores, sustituibles sin tocar el núcleo.

> **Alcance:** al ser un proyecto académico pensado para probarse sin fricción, **no incluye autenticación**. El «actor activo» del portal se fija por variable de entorno (`VITE_ACTOR_ID` / `EXPO_PUBLIC_ACTOR_ID`, por defecto el actor demo `a1`). Razonamiento completo en [§1.2 del textbook](./ARCHITECTURE_TEXTBOOK.md#12-design-principles).

---

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Lenguaje | TypeScript (modo estricto) en todo el repositorio |
| Monorepo | npm workspaces (`packages/*`, `api`, `apps/*`) |
| Panel web | React 19, Vite 6, react-router-dom 7, sonner, lucide-react |
| App móvil | React Native 0.81, Expo SDK 54, expo-router, expo-camera |
| Backend | Vercel Serverless Functions (un router propio en `api/router.ts`) |
| Base de datos | PostgreSQL serverless en [Neon.tech](https://neon.tech), acceso con Prisma 6 |
| Validación | Zod (todos los DTO de entrada de la API) |
| Almacenamiento | Cloudinary (vídeo, subida firmada directa desde el cliente) y Vercel Blob (documentos adjuntos) |
| IA | OpenAI Whisper (transcripción) + GPT-4o-mini (evaluación/puntuación) |
| Pruebas | Vitest, Testing Library, Jest + jest-expo, Playwright (E2E web), Maestro (E2E móvil) |
| Despliegue | Vercel (web + API), EAS Build (app móvil) |

---

## 3. Instalación y ejecución

### 3.1 Requisitos

- **Node.js 20 o superior** y **npm** (gestor con el que se ha desarrollado y probado el proyecto; el repositorio incluye `package-lock.json`).
- Una base de datos PostgreSQL (recomendado: un proyecto gratuito de [Neon.tech](https://neon.tech)).
- Opcional: cuentas de OpenAI y Cloudinary si quieres probar la subida de vídeo y el análisis con IA en local.

> **Sobre pnpm / yarn:** el proyecto usa _npm workspaces_ y overrides definidos en el `package.json` raíz, y solo se ha verificado con npm. pnpm y yarn no están soportados oficialmente (pnpm, por ejemplo, requeriría un `pnpm-workspace.yaml` propio).

### 3.2 Instalación

```bash
git clone https://github.com/SergioSNW/masterAI-tfm.git
cd masterAI-tfm
npm install --legacy-peer-deps
```

`--legacy-peer-deps` es necesario por una discrepancia de _peer dependencies_ con React 19 en el árbol de Expo; es el mismo flag que usa el despliegue en Vercel (`vercel.json`).

### 3.3 Variables de entorno

```bash
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env
```

| Variable | Archivo | Necesaria para |
|---|---|---|
| `DATABASE_URL` | `.env` | Todo lo que toque la base de datos (Prisma) |
| `OPENAI_API_KEY` | `.env` | Análisis con IA (`POST /api/analyze`) |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | `.env` | Subida de vídeos de actores |
| `BLOB_READ_WRITE_TOKEN` | `.env` | Subida de documentos a las rondas (Vercel lo inyecta en producción; en local solo con `vercel dev`) |
| `VITE_ACTOR_ID` | entorno del web | Actor activo del portal web (por defecto `a1`) |
| `EXPO_PUBLIC_API_URL` | `apps/mobile/.env` | API a la que apunta la app móvil (por defecto, la desplegada) |
| `EXPO_PUBLIC_ACTOR_ID` | `apps/mobile/.env` | Actor activo de la app móvil (por defecto `a1`) |

### 3.4 Base de datos

```bash
npm run prisma:generate                # genera el cliente Prisma
npm run prisma:push                    # crea las tablas en tu base de datos
npm run prisma:seed -w packages/database   # datos de demostración
```

### 3.5 Ejecución

**Vía rápida (solo el panel web, contra la API desplegada):** el servidor de desarrollo de Vite redirige `/api` a `https://master-ai-tfm.vercel.app` por defecto (`apps/web/vite.config.ts`), así que no necesitas base de datos ni claves para ver la aplicación funcionando:

```bash
npm run dev:web        # http://localhost:3000
```

> ⚠️ Este modo trabaja contra la base de datos de la demo desplegada, no contra una local.

**Entorno local completo (con tu propia base de datos):**

```bash
npx vercel dev --port 3001                              # API serverless en :3001 (requiere `vercel login`)
VITE_API_PROXY_TARGET=http://localhost:3001 npm run dev:web   # web apuntando a esa API local
```

En Windows PowerShell la variable se define antes: `$env:VITE_API_PROXY_TARGET="http://localhost:3001"; npm run dev:web`.

**App móvil:**

```bash
npm run dev:mobile       # Expo: escanea el QR con Expo Go (o con tu dev client)
npm run dev:mobile:web   # la misma app en el navegador, sin teléfono
```

### 3.6 Compilación

```bash
npm run build:web        # compila core → database → infrastructure → bundle de la API → panel web
```

---

## 4. Estructura del proyecto

```
masterAI-tfm/
├── packages/
│   ├── core/              # Entidades, casos de uso y repositorios (interfaces) — sin dependencias
│   ├── database/           # Esquema Prisma, cliente generado y script de seed
│   └── infrastructure/      # Repositorios Prisma + esquemas Zod
├── api/
│   ├── router.ts            # Router propio: 27 rutas en una única función serverless
│   ├── ai/                   # Adaptador OpenAI (Whisper + GPT-4o-mini)
│   └── cloudinary/sign.ts    # Firma de subidas a Cloudinary
├── apps/
│   ├── web/                   # Panel de directores + portal web de actores (React + Vite)
│   └── mobile/                 # App de actores (Expo + React Native)
├── e2e/                        # Pruebas Playwright y scripts de simulación de la API
├── ARCHITECTURE_TEXTBOOK.md    # Referencia de arquitectura detallada (inglés)
└── vercel.json                  # Configuración de despliegue
```

Las dependencias apuntan siempre hacia dentro:

```
apps/web ─┐
          ├─► api/router.ts ─► packages/infrastructure ─► packages/core
apps/mobile ┘                     (Prisma + Zod)          (sin dependencias)
                                        │
                                        ▼
                                Neon.tech PostgreSQL
```

- **`packages/core`** — 8 entidades, 25 casos de uso, 8 interfaces de repositorio. TypeScript puro.
- **`packages/infrastructure`** — implementaciones Prisma de los repositorios y 20 esquemas Zod. Único paquete autorizado a importar Prisma o Zod.
- **`api/`** — cada ruta valida con Zod → instancia el caso de uso → traduce su `Result` a HTTP.
- **`apps/*`** — capas de interfaz; no contienen reglas de negocio.

---

## 5. Funcionalidades cubiertas

### Director (panel web)

- Gestión de **proyectos**: crear y cambiar de estado (borrador / activo / cerrado).
- Gestión de **castings** (papeles) por proyecto, con descripción y requisitos, y cambio de **fase** del casting.
- Gestión de **rondas** de audición: crear, abrir y cerrar, con fecha límite.
- **Materiales adjuntos** por ronda (guiones, referencias): subida directa a Vercel Blob, listado y borrado.
- **Gestión de actores**: alta, búsqueda por nombre/correo, edición, borrado, vista en cuadrícula/lista e índice A–Z.
- **Revisión de envíos**: reproducción del vídeo, marcado como revisado / preseleccionado / rechazado, feedback y **comentarios**.
- **Análisis con IA** de cada envío: transcripción del audio (Whisper) y puntuación con feedback razonado (GPT-4o-mini) contra los requisitos del casting.
- Subida de vídeo **en nombre de un actor** desde el panel.
- Documentación (`/docs`) y ayuda (`/help`) integradas en la propia aplicación.

### Actor (portal web y app móvil)

- Listado de **castings abiertos**, con estado del propio envío y feedback del director.
- **Grabación de self-tape con la cámara** (app móvil) o subida de archivo (portal web, hasta 100 MB), enviada directamente a Cloudinary.
- Consulta de los **materiales** de la ronda (portal web y app móvil) y de los **comentarios** del director sobre su envío (app móvil).
- **Perfil editable** (portal web, `/actor/settings`): nombre, correo, teléfono, agencia y biografía, sobre el mismo registro `Actor` que ve el director.

### Transversales

- **Arquitectura limpia** con núcleo sin dependencias y un catálogo de 28 endpoints validados con Zod.
- **Subida directa de archivos** (Cloudinary / Vercel Blob): los bytes nunca pasan por la función serverless ni por la base de datos.
- Errores tipados de la IA (límite de peticiones, fallo de autenticación, servicio caído) traducidos a códigos HTTP coherentes.
- **265 pruebas automatizadas** + 6 flujos E2E de móvil con Maestro (ver [§7](#7-pruebas)).
- Sin autenticación por decisión de alcance (ver nota en [§1](#1-descripción-general)).

---

## 6. Proyecto desplegado

| Componente | Dónde | Estado |
|---|---|---|
| Panel web + API | Vercel — [master-ai-tfm.vercel.app](https://master-ai-tfm.vercel.app) | ✅ Desplegado |
| Base de datos | Neon.tech (PostgreSQL) | ✅ Con datos de demostración |
| Vídeo / documentos | Cloudinary / Vercel Blob | ✅ |
| App Android | Build interno de EAS (APK) | Se regenera bajo demanda (ver abajo) |
| App iOS | — | No publicada (ver abajo) |

Escanea para abrir el panel web:

<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fmaster-ai-tfm.vercel.app" alt="QR al panel web desplegado" width="200" height="200" />

En la pantalla inicial elige **Director** o **Actor**.

**App móvil.** El APK de Android se genera con EAS Build; los artefactos caducan a los ~30 días, por lo que se regenera antes de cada demo:

```bash
cd apps/mobile
eas build --profile preview --platform android
```

Para iOS, las builds internas solo se instalan en dispositivos cuyo UDID esté registrado de antemano, así que una distribución abierta requeriría TestFlight (Apple Developer Program). La misma app puede ejecutarse en cualquier iPhone con Expo Go (`npm run dev:mobile`) o en el navegador (`npm run dev:mobile:web`).

---

## 7. Pruebas

```bash
npm run test               # core + infrastructure + web
npm run test:core          # 84 pruebas — casos de uso (los 25 tienen su archivo)
npm run test:infra         # 36 pruebas — esquemas Zod
npm run test:web           # 101 pruebas — servicios, componentes y contextos
npm run test:e2e           # 11 pruebas Playwright (requieren la web en marcha)
npm test -w apps/mobile    # 35 pruebas — servicios y componentes móviles
npm run maestro:test       # 6 flujos E2E móviles (requieren simulador o dispositivo)
```

Detalle de la estrategia de testing en el [§19 del textbook](./ARCHITECTURE_TEXTBOOK.md#19-testing-strategy).

---

## 8. Presentación

- **Slides:** _pendiente de publicar_
- **Repositorio:** [github.com/SergioSNW/masterAI-tfm](https://github.com/SergioSNW/masterAI-tfm)
- **Documentación técnica ampliada:** [ARCHITECTURE_TEXTBOOK.md](./ARCHITECTURE_TEXTBOOK.md)
