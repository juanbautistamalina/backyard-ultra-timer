# 🏃‍♂️ Backyard Ultra Timer - Instrucciones para Organizador

## 📋 Qué es esto
Un cronómetro especializado para eventos Backyard Ultra que reproduce alarmas automáticas cada hora:
- **57:00** → Bocina (aviso de 3 minutos)
- **58:00** → Alarma (aviso de 2 minutos) 
- **59:00** → Alarma fuerte (aviso de 1 minuto)
- **59:49** → Multitud (aviso de 11 segundos)

## 💻 Requisitos
- **Computadora con Windows** (cualquier versión moderna)
- **Navegador web** (Chrome, Firefox, Edge - ya vienen con Windows)
- **NO necesitas instalar nada más**

## 📁 Archivos que recibes
```
backyard-ultra-timer/
├── dist/                    ← Esta es la carpeta importante
│   ├── index.html
│   ├── assets/
│   └── audio/
└── INSTRUCCIONES_ORGANIZADOR.md  ← Este archivo
```

## 🚀 Pasos para usar (MUY FÁCIL)

### Paso 1: Preparar
1. Copia la carpeta `dist` a tu escritorio
2. Abre el **Símbolo del sistema** (CMD):
   - Presiona `Windows + R`
   - Escribe `cmd` y presiona Enter

### Paso 2: Navegar a la carpeta
En la ventana negra que se abrió, escribe:
```
cd Desktop\dist
```
Presiona Enter

### Paso 3: Iniciar el servidor
Escribe exactamente esto:
```
python -m http.server 8000
```
Presiona Enter

**Si aparece un error de "python no reconocido":**
- Escribe: `py -m http.server 8000`
- Si sigue sin funcionar, ve al **Plan B** más abajo

### Paso 4: Abrir el cronómetro
1. Abre tu navegador web (Chrome, Firefox, Edge)
2. En la barra de direcciones escribe: `localhost:8000`
3. Presiona Enter
4. ¡Ya tienes el cronómetro funcionando!

## 🎯 Cómo usar el cronómetro

### Controles principales
- **Iniciar** → Comienza el cronómetro
- **Detener** → Pausa el cronómetro
- **Reiniciar** → Vuelve a 00:00:00
- **Test 56:00** → Salta a los 56 minutos para probar las alarmas

### Información que muestra
- **Tiempo transcurrido** → Cronómetro principal
- **Vuelta actual** → Qué vuelta están corriendo
- **Vueltas completadas** → Cuántas vueltas terminaron
- **Kilómetros** → Total recorrido (6.7 km por vuelta)

## 🔧 Plan B (si Python no funciona)

### Opción alternativa con Node.js
Si tu computadora tiene Node.js instalado:
```
npx serve dist
```
Luego abre: `localhost:3000`

### Opción de emergencia
Si nada funciona, usa la versión standalone:
1. Ve a la carpeta `standalone`
2. Haz doble clic en `index.html`
3. Funcionará pero **sin sonidos** (solo alertas visuales)

## ⚠️ Solución de problemas

### "No se puede conectar a localhost"
- Verifica que el comando esté ejecutándose (debe mostrar algo como "Serving at port 8000")
- Prueba con `127.0.0.1:8000` en lugar de `localhost:8000`

### "Los sonidos no se escuchan"
- Verifica que el volumen esté activado
- Algunos navegadores requieren que hagas clic en la página antes de reproducir audio
- Presiona "Test 56:00" para probar las alarmas rápidamente

### "La página no carga"
- Asegúrate de estar en la carpeta `dist` cuando ejecutes el comando
- Verifica que escribiste correctamente `localhost:8000`

## 🎵 Prueba de sonidos
1. Inicia el cronómetro
2. Presiona "Test 56:00"
3. En 1 minuto escucharás todas las alarmas:
   - Bocina a los 57:00
   - Alarma a los 58:00  
   - Alarma fuerte a los 59:00
   - Multitud a los 59:49

## 📱 Consejos para el evento
- **Mantén la ventana del navegador abierta** durante todo el evento
- **No cierres la ventana CMD** (la ventana negra)
- **Ajusta el volumen** antes de que empiecen las carreras
- **Prueba todo** antes del evento real
- El cronómetro funciona **sin internet** una vez iniciado

## 🆘 Contacto de emergencia
Si tienes problemas técnicos durante el evento, anota:
- Qué error aparece exactamente
- En qué paso te quedaste
- Qué navegador estás usando

## ✅ Checklist pre-evento
- [ ] Copié la carpeta `dist` al escritorio
- [ ] Probé abrir CMD y navegar a la carpeta
- [ ] El comando `python -m http.server 8000` funciona
- [ ] Puedo abrir `localhost:8000` en el navegador
- [ ] Los sonidos se escuchan correctamente
- [ ] Probé la función "Test 56:00"
- [ ] El volumen está en un nivel adecuado

---

**¡Listo para tu evento Backyard Ultra! 🏃‍♂️🏃‍♀️**
