# Guía para Uso Offline - Backyard Ultra Timer

## ✅ Estado Actual
Tu proyecto ya está **completamente preparado** para uso offline. No requiere conexión a internet.

## 📁 Archivos Generados
El comando `npm run build` ha creado la carpeta `dist/` con todos los archivos necesarios:

```
dist/
├── index.html          # Página principal
├── favicon.svg         # Icono
├── assets/            
│   ├── index-DkYKJA19.js    # JavaScript minificado
│   └── index-BAhWRjOR.css   # CSS minificado
└── audio/             # Archivos de sonido
    ├── alarma.mp3
    ├── alarma_fuerte.mp3
    ├── bocina.mp3
    └── multitud.mp3
```

## 🚀 Opciones para Usar Offline

### Opción 1: Servidor Local Simple (Recomendado)
```bash
# Desde la carpeta del proyecto
npx serve dist
```
Luego abre: `http://localhost:3000`

### Opción 2: Python (si tienes Python instalado)
```bash
# Navega a la carpeta dist
cd dist

# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Luego abre: `http://localhost:8000`

### Opción 3: Node.js http-server
```bash
# Instalar globalmente (una sola vez)
npm install -g http-server

# Servir desde dist
http-server dist
```

### Opción 4: Abrir directamente (Limitado)
Puedes abrir `dist/index.html` directamente en el navegador, pero:
- ⚠️ Los archivos de audio pueden no funcionar por restricciones CORS
- ⚠️ Algunos navegadores bloquean `file://` para audio

## 📦 Para Distribución Offline

### Crear paquete portable:
1. Copia toda la carpeta `dist/` 
2. Renómbrala a `backyard-ultra-timer-offline`
3. Incluye estas instrucciones

### Para otros dispositivos:
- La carpeta `dist/` es completamente autónoma
- No requiere Node.js ni npm para funcionar
- Solo necesita un servidor web básico

## 🔧 Solución de Problemas

### Si los sonidos no funcionan:
- Asegúrate de usar un servidor web (no abrir directamente el archivo)
- Verifica que los archivos `.mp3` estén en `dist/audio/`
- Algunos navegadores requieren interacción del usuario antes de reproducir audio

### Si hay errores de CORS:
- Usa cualquiera de las opciones de servidor local mencionadas
- No abras el archivo HTML directamente desde el explorador

## ✨ Características Offline Incluidas
- ✅ Temporizador completo funcional
- ✅ Todos los sonidos de alarma (bocina, alarma, alarma fuerte, multitud)
- ✅ Interfaz completa en español
- ✅ Contador de vueltas y kilómetros
- ✅ Función de prueba (saltar a 56:00)
- ✅ Sin dependencias externas
