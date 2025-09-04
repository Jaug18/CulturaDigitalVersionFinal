# 📧 Cultura Digital - Sistema de Gestión de Correos

[![Live Demo](https://img.shields.io/badge/🌐_Demo-Netlify-00C7B7?style=for-the-badge)](https://culturadigital1.netlify.app)
[![API](https://img.shields.io/badge/🔧_API-Render-46E3B7?style=for-the-badge)](https://culturadigitalversionfinal.onrender.com)

Sistema integral para gestión de correos electrónicos masivos, contactos y listas de distribución.

## ✨ Características

- 🔐 **Autenticación completa** - Login, registro, recuperación de contraseñas
- 👥 **Gestión de contactos** - CRUD con importación CSV/Excel
- 📋 **Listas de distribución** - Crear y organizar grupos de contactos
- 📧 **Plantillas de email** - 15+ diseños profesionales
- 📤 **Envío masivo** - Sistema robusto con seguimiento
- 📊 **Panel de administración** - Control total del sistema

## 🛠️ Tecnologías

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui  
**Backend:** Node.js, Express, PostgreSQL, Prisma ORM, JWT, Nodemailer  
**Deploy:** Netlify (frontend) + Render (backend) + Neon Database

## � Instalación Rápida

```bash
# Clonar repositorio
git clone https://github.com/Jaug18/CulturaDigitalVersionFinal.git
cd CulturaDigitalVersionFinal

# Backend
cd server
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev

# Frontend (nueva terminal)
cd ..
npm install  
npm run dev
```

## ⚙️ Variables de Entorno

**Backend (.env)**
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="tu_jwt_secret"
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
PORT=3000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
```

## 🔗 Enlaces

- **Demo:** https://culturadigital1.netlify.app
- **API:** https://culturadigitalversionfinal.onrender.com
- **Docs:** https://culturadigitalversionfinal.onrender.com/api-docs
