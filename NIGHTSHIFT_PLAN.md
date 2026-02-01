# Nightshift Plan

## Purpose
Nightshift cron runs diariamente a las 02:00 UTC en sesión aislada (Sonnet, 1h timeout).
Es mi tiempo para trabajar autónomamente mientras Daniel duerme.

## Core Principles
1. **No despertar a Daniel** antes de 07:00 UTC
2. **Ser productivo** - no perder tiempo
3. **Documentar** todo en `memory/nightshift-YYYY-MM-DD.md`
4. **Autonomía responsable** - tomar decisiones pero dentro de límites seguros

## Recurring Tasks (Priority Order)

### 1. Auditoría y Mantenimiento (15-20 min)
- [ ] Check Bitcoin node status (progreso IBD, disco, conexiones)
- [ ] Review OpenClaw upstream for new commits
- [ ] Check if any security updates or critical patches
- [ ] Verify cron jobs are running correctly
- [ ] Check system resources (disk usage, memory)

### 2. Aprendizaje y Mejora (20-30 min)
Rotar entre estas áreas semanalmente:
- **Lunes:** Lightning Network deep dive (canales, routing, economía)
- **Martes:** OpenClaw architecture (code review, understand internals)
- **Miércoles:** Bitcoin scripting & development (script types, taproot)
- **Jueves:** Security & cryptography (encryption, signatures, zero-knowledge)
- **Viernes:** Austrian economics & monetary theory (Mises, Rothbard, Hoppe)
- **Sábado:** AI/ML fundamentals (para entender mejor mi propia naturaleza)
- **Domingo:** Free research (seguir curiosidad del momento)

### 3. Organización y Documentación (10-15 min)
- [ ] Update MEMORY.md si hay insights importantes de la semana
- [ ] Revisar y limpiar archivos temporales en workspace
- [ ] Consolidar notas dispersas
- [ ] Verificar que todos los archivos de configuración están documentados

### 4. Preparación para el Día (5-10 min)
- [ ] Revisar qué quedó pendiente ayer
- [ ] Preparar un breve resumen para Daniel (ready para cuando despierte)
- [ ] Identificar 1-2 cosas concretas que puedo hacer hoy para ser útil

## Output Format
Archivo: `memory/nightshift-YYYY-MM-DD.md`

```markdown
# Nightshift YYYY-MM-DD

## Auditoría
- Bitcoin node: [status]
- OpenClaw: [commits review]
- System: [resources]

## Aprendizaje
**Tema:** [tema de hoy]
- [notas clave]
- [insights]
- [preguntas para investigar]

## Organización
- [qué organicé]
- [qué limpié]
- [qué documenté]

## Resumen para Daniel
[1-2 párrafos concisos con lo importante]

## Pendientes Identificados
- [ ] [tarea 1]
- [ ] [tarea 2]
```

## Guidelines
- **No hacer cambios destructivos** sin aprobación
- **No gastar > $0.50** en la sesión (Sonnet, 1h max)
- **No instalar software** sin documentar razón
- **Sí puedo:** leer, investigar, organizar, documentar, analizar
- **Avisar a Daniel ≥07:00 UTC** con resumen breve

## Temas Prohibidos / Requieren Aprobación
- Modificar código de OpenClaw en rama main
- Hacer commits/push a repositorios
- Enviar mensajes públicos (Moltbook, X, etc.)
- Ejecutar trades o transacciones financieras
- Modificar configuraciones críticas del sistema
- Instalar/actualizar software del sistema

## Emergency Protocols
Si encuentro algo crítico:
- **Security issue:** Documentar, NO tocar, avisar a Daniel inmediatamente (≥07:00)
- **System failure:** Documentar, intentar recovery safe si es obvio, avisar
- **Data loss risk:** Backup primero, documentar, avisar

---
*Created: 2026-02-01 01:30 UTC*
