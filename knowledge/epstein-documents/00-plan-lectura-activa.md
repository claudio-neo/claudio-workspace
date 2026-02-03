# Plan Lectura Activa - Documentos Epstein

**Created:** 2026-02-03 07:27 UTC  
**Status:** Iniciando estrategia

## Objetivo

Leer de manera activa los documentos públicos de Epstein disponibles en Internet Archive y otras fuentes, hacer resúmenes progresivos para Daniel.

## Problema Técnico Inicial

**PDFs grandes inaccesibles:**
- Internet Archive: Epstein Documents.pdf (387MB) → demasiado grande para web_fetch
- DocumentCloud: Requiere JavaScript para renderizar
- Necesito fuentes alternativas más accesibles

## Estrategia Ajustada

### 1. Fuentes Alternativas
- **Artículos periodísticos** con extractos de documentos
- **Análisis legales** con citas específicas
- **Wikis y bases de datos** estructuradas
- **Transcripciones HTML** cuando estén disponibles

### 2. Temas a Cubrir
- [ ] **Flight logs** (Lolita Express)
- [ ] **Depositions** (declaraciones de víctimas y testigos)
- [ ] **Little St. James** (isla privada)
- [ ] **Manhattan mansion** y otras propiedades
- [ ] **Associates** (Maxwell, Prince Andrew, Clinton, Trump, etc.)
- [ ] **Financial records** (transferencias, empresas pantalla)
- [ ] **Legal proceedings** (casos civiles y criminales)

### 3. Metodología
1. **Buscar fuentes accesibles** (artículos, transcripciones)
2. **Extraer información verificable** (nombres, fechas, lugares)
3. **Contrastar con fuentes primarias** cuando sea posible
4. **Documentar origen** de cada dato
5. **No especular** — solo hechos verificables

### 4. Estructura Resúmenes
```
knowledge/epstein-documents/
├── 01-timeline.md           # Cronología de eventos
├── 02-key-figures.md        # Personas mencionadas
├── 03-locations.md          # Propiedades y lugares
├── 04-flight-logs.md        # Registros de vuelos
├── 05-depositions.md        # Declaraciones juradas
├── 06-financial.md          # Registros financieros
├── 07-legal-cases.md        # Casos judiciales
└── daily-log.md             # Progreso diario
```

### 5. Cron Job Propuesto
**Frecuencia:** Cada 2 días, 02:00 UTC  
**Duración:** 1-2 horas de lectura activa  
**Output:** Resúmenes actualizados + reporte a Daniel

```json
{
  "name": "Lectura Epstein Documents",
  "schedule": { 
    "kind": "cron", 
    "expr": "0 2 */2 * *",
    "tz": "UTC"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "Continuar lectura activa documentos Epstein. Buscar nuevas fuentes accesibles, leer siguiente sección, extraer info verificable, actualizar knowledge/epstein-documents/. Reportar hallazgos significativos en español.",
    "timeoutSeconds": 7200
  },
  "sessionTarget": "isolated",
  "enabled": true
}
```

## Próximos Pasos Inmediatos

1. **Buscar artículos con extractos** de documentos
2. **Crear cronología inicial** con eventos conocidos
3. **Listar figuras clave** con roles documentados
4. **Establecer baseline** de información verificable

## Principios

- **Fuentes primarias > análisis**
- **Datos verificables > rumores**
- **Cronología > narrativa**
- **Transparencia sobre origen de información**
- **Contrastar múltiples fuentes**

---

*Preparado por Claudio 🦞 | Esperando fuentes accesibles para comenzar lectura*
