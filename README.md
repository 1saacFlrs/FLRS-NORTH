# FLRS NORTH E-Commerce

Bienvenido al proyecto de FLRS NORTH. Este es un sitio web de e-commerce minimalista enfocado en streetwear premium, construido con React, Tailwind CSS y Firebase. 

## ⚙️ Stack Tecnológico

- **Frontend:** React 19 + Vite
- **Estilos:** Tailwind CSS 4
- **Base de datos & Auth:** Firebase Firestore, Firebase Storage y Firebase Auth.
- **Estado Global:** Zustand (para el carrito de compras)
- **Animaciones:** Framer Motion

## 🚀 Cómo ejecutar el proyecto (Localmente)

Si has descargado o clonado este repositorio, sigue estos pasos:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la página.

## 🔥 Cómo conectar Firebase (Configuración)

Para que la base de datos funcione fuera de Google AI Studio, debes agregar tus propias credenciales.

1. Selecciona o crea un proyecto en la consola de Firebase.
2. Habilita **Firestore Database**, **Authentication** (Email/Password), y **Storage**.
3. Copia tus credenciales de Firebase Config.
4. Actualiza el archivo de configuración `firebase-applet-config.json` (o `.env` si lo migras con Vite variables `VITE_FIREBASE_API_KEY`, etc.)

*Nota:* Si estás en AI Studio, el archivo `firebase-applet-config.json` ya está autogenerado por la plataforma.

## 👑 Cómo utilizar el Panel de Admin

El sistema tiene un panel protegido `/admin`.

1. **Crear super admin:** El primer acceso está encriptado bajo el email del creador especificado en las Reglas de Firestore.
2. **Login:** Ingresa en `http://localhost:3000/admin` con tu correo y contraseña. (Deberás registrar este usuario manualmente la primera vez en Auth de Firebase y enviarle el config a la DB si no se hace mediante reglas en duro, en caso de AI Studio depende del correo actual).
3. **Agregar/Editar Productos:** Usa el botón "Add Product"
4. **Imágenes:** Puedes subir imágenes directamente que se guardarán en Firebase Storage (verificar que Storage esté habilitado) o pegar la URL externa de la misma.

## 📦 Cómo subir imágenes
En el menú de "Crear producto" o "Editar producto" en `/admin`, tienes dos opciones de subida de imágenes:
1. Mediante la caja de arrastrar y soltar/examinar archivo desde tu computadora (Lo subirá directo a Firebase Storage).
2. O bien colocando una URL que apunte a un servicio de hosting externo.

## 🌐 Cómo desplegar (Vercel o Netlify)

1. Enlaza tu repositorio de GitHub en Vercel o Netlify.
2. Asegúrate de configurar en settings que el build command sea `npm run build` o `vite build` y el "Publish Directory" (output) a `dist`.
3. Si cambias la configuración de Firebase a variables de entorno, no olvides agregar las "Environment Variables" correspondientes en Vercel/Netlify.
