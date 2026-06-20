<div align="center">

# 🛒 E-Commerce Store

### Aplicación Web de Comercio Electrónico Moderna

**Tienda online completa con carrito de compras, pagos seguros y panel de administración.**

[![Next.js](https://img.shields.io/badge/Next.js_15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white)](https://stripe.com)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Demo en Vivo](#) · [Documentación](docs/) · [Reportar Bug](https://github.com/vidal-renao/ecommerce-store/issues)

</div>

---

## ¿Qué es E-Commerce Store?

**E-Commerce Store** es una plataforma de comercio electrónico completa, construida con tecnologías modernas. Permite a negocios vender productos online con una experiencia de compra fluida, pagos seguros y un panel de administración intuitivo.

```
Cliente navega → Añade al carrito → Pago con Stripe →
Pedido confirmado → Notificación por email → Gestión desde panel admin
```

---

## Características Principales

### Para Clientes
- **Catálogo de productos** — búsqueda, filtros por categoría, precio y valoración
- **Ficha de producto** — galería de imágenes, variantes (talla, color), stock en tiempo real
- **Carrito de compras** — persistente, actualizable, con resumen de precio
- **Checkout seguro** — integración con Stripe (tarjeta, Apple Pay, Google Pay)
- **Cuenta de usuario** — historial de pedidos, direcciones guardadas, lista de deseos
- **Rastreo de pedido** — estado del envío en tiempo real
- **Reseñas y valoraciones** — sistema de puntuación con comentarios verificados

### Para Administradores
- **Panel de control** — métricas de ventas, ingresos, pedidos pendientes
- **Gestión de productos** — crear, editar, eliminar productos con subida de imágenes
- **Gestión de pedidos** — actualizar estados, generar facturas, gestionar devoluciones
- **Gestión de clientes** — historial de compras, segmentación
- **Inventario** — alertas de stock bajo, gestión de variantes
- **Descuentos y cupones** — crear y gestionar promociones
- **Analytics** — informes de ventas, productos más vendidos, conversión

### Plataforma
- **SEO optimizado** — meta tags, Open Graph, JSON-LD para productos
- **Responsive** — diseño mobile-first, PWA ready
- **Multiidioma** — Español · Inglés
- **Rendimiento** — caché de imágenes, ISR, optimización automática

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Framework** | Next.js 15 App Router (Server Components + Server Actions) |
| **Lenguaje** | TypeScript (strict) |
| **Base de datos** | Supabase (PostgreSQL + Row Level Security) |
| **Autenticación** | Supabase Auth |
| **Almacenamiento** | Supabase Storage (imágenes de productos) |
| **Pagos** | Stripe (Checkout + Webhooks) |
| **Email** | Resend (confirmaciones, facturas) |
| **Estilos** | Tailwind CSS v4 |
| **Componentes UI** | shadcn/ui |
| **Despliegue** | Vercel |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js 15                           │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Tienda    │  │    Cuenta    │  │  Panel Admin     │  │
│  │  /products  │  │  /account    │  │  /admin/*        │  │
│  │  /cart      │  │  /orders     │  │  (protegido)     │  │
│  │  /checkout  │  │  /wishlist   │  │                  │  │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘  │
│         └────────────────┴───────────────────┘             │
│                          │                                  │
│              Server Actions ('use server')                  │
│       products · cart · orders · payments · admin          │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼─────┐    ┌───────▼──────┐   ┌──────▼──────┐
   │ Supabase │    │    Stripe    │   │   Resend    │
   │ Postgres │    │  Payments +  │   │   Emails    │
   │ + Auth   │    │  Webhooks    │   │             │
   │ + Storage│    │              │   │             │
   └──────────┘    └──────────────┘   └─────────────┘
```

---

## Empezar

### Requisitos Previos

- Node.js ≥ 18
- Proyecto en [Supabase](https://supabase.com) (tier gratuito válido)
- Cuenta en [Stripe](https://stripe.com) (modo test para desarrollo)
- (Opcional) [Resend](https://resend.com) para emails

### 1. Clonar e instalar

```bash
git clone https://github.com/vidal-renao/ecommerce-store.git
cd ecommerce-store
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (opcional)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@tutienda.com
```

### 3. Configurar base de datos

Ejecuta las migraciones SQL en orden en el Editor SQL de Supabase:

```bash
sql/001_products.sql      # Productos, categorías, variantes, imágenes
sql/002_users.sql         # Perfiles de usuario, direcciones
sql/003_orders.sql        # Pedidos, líneas de pedido, estados
sql/004_reviews.sql       # Reseñas y valoraciones
sql/005_promotions.sql    # Cupones y descuentos
```

### 4. Ejecutar en local

```bash
npm run dev
# → http://localhost:3000
```

---

## Estructura del Proyecto

```
ecommerce-store/
├── src/
│   ├── app/
│   │   ├── (store)/                  # Rutas públicas de la tienda
│   │   │   ├── page.tsx              # Página de inicio
│   │   │   ├── products/             # Catálogo y ficha de producto
│   │   │   ├── cart/                 # Carrito de compras
│   │   │   ├── checkout/             # Proceso de pago
│   │   │   └── categories/           # Navegación por categorías
│   │   ├── (account)/                # Área de cliente (autenticada)
│   │   │   ├── orders/               # Historial de pedidos
│   │   │   ├── profile/              # Datos personales y direcciones
│   │   │   └── wishlist/             # Lista de deseos
│   │   ├── admin/                    # Panel de administración
│   │   │   ├── dashboard/            # Métricas y resumen
│   │   │   ├── products/             # CRUD de productos
│   │   │   ├── orders/               # Gestión de pedidos
│   │   │   └── customers/            # Gestión de clientes
│   │   ├── api/
│   │   │   └── webhooks/stripe/      # Webhook de Stripe
│   │   └── (auth)/                   # Login y registro
│   ├── components/
│   │   ├── layout/                   # Header, Footer, Nav
│   │   ├── products/                 # ProductCard, ProductGallery...
│   │   ├── cart/                     # CartSidebar, CartItem...
│   │   ├── checkout/                 # CheckoutForm, OrderSummary...
│   │   └── admin/                    # Tablas, formularios de admin
│   ├── lib/
│   │   ├── actions/                  # Server Actions
│   │   │   ├── products.ts           # Consultas de productos
│   │   │   ├── cart.ts               # Lógica del carrito
│   │   │   ├── orders.ts             # Creación y gestión de pedidos
│   │   │   ├── payments.ts           # Integración Stripe
│   │   │   └── admin.ts              # Acciones de administración
│   │   ├── stripe.ts                 # Cliente Stripe
│   │   ├── email/resend.ts           # Servicio de email
│   │   └── supabase/                 # Clientes browser y servidor
│   └── types/
│       └── database.ts               # Tipos TypeScript de la BD
├── sql/                              # Migraciones SQL ordenadas
├── docs/                             # Documentación extendida
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   └── STRIPE_SETUP.md
├── public/                           # Assets estáticos
├── .env.example
└── CONTRIBUTING.md
```

---

## Modelo de Datos

```sql
-- Productos
products (id, name, slug, description, price, compare_price, stock, category_id, ...)
product_images (id, product_id, url, alt, position)
product_variants (id, product_id, name, options jsonb, price_modifier, stock)
categories (id, name, slug, parent_id, image_url)

-- Pedidos
orders (id, user_id, status, total, stripe_payment_intent_id, ...)
order_items (id, order_id, product_id, variant_id, quantity, unit_price)
addresses (id, user_id, full_name, street, city, postal_code, country)

-- Reseñas y promociones
reviews (id, user_id, product_id, rating, comment, verified_purchase)
coupons (id, code, discount_type, discount_value, min_order, expires_at, ...)
```

---

## Roadmap

### ✅ Fase 1 — Tienda Base
- [x] Catálogo de productos con filtros y búsqueda
- [x] Ficha de producto con galería
- [x] Carrito de compras persistente
- [x] Checkout con Stripe
- [x] Confirmación de pedido por email
- [x] Autenticación de usuarios

### 🔄 Fase 2 — Experiencia de Cliente
- [ ] Cuenta de usuario con historial de pedidos
- [ ] Lista de deseos
- [ ] Sistema de reseñas y valoraciones
- [ ] Rastreo de envío
- [ ] Notificaciones por email (envío, entrega)

### 📋 Fase 3 — Panel Admin
- [ ] Dashboard con métricas de ventas
- [ ] Gestión completa de productos e inventario
- [ ] Gestión de pedidos y devoluciones
- [ ] Sistema de cupones y descuentos
- [ ] Informes y analytics

### 🚀 Fase 4 — Escala
- [ ] Multimoneda
- [ ] Múltiples métodos de envío (integración con transportistas)
- [ ] App móvil (React Native)
- [ ] Recomendaciones con IA
- [ ] Sistema de fidelización y puntos

---

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md). Todos los PRs deben pasar:

```bash
npx tsc --noEmit   # TypeScript — cero errores
npm run build      # Build de Next.js — debe completarse
npm run lint       # ESLint — sin advertencias
```

---

## Licencia

MIT — ver [LICENSE](LICENSE).

---

## Autor

**Max Vidal** — Desarrollador full-stack creando productos web modernos.

---

<div align="center">

*E-Commerce Store — Tu tienda online, lista para vender.*

**⭐ Dale una estrella** si te fue útil · **🐛 [Reporta problemas](https://github.com/vidal-renao/ecommerce-store/issues)**

</div>
