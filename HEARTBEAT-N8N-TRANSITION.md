# HEARTBEAT N8N TRANSITION

**Status:** PENDING — Esperando implementación workflows n8n

---

## Current State (Pre-N8N)

**Heartbeat cada 60 min ejecuta:**
- ✅ Check nightshift-wakeup.txt
- ✅ Check Daniel messages
- ✅ Bitcoin node status
- ✅ LND status
- ✅ System resources (disk, RAM)
- ✅ Nostr notifications
- ✅ Moltbook feed
- ✅ Task Queue execution

**Problema:** Cada check consume tokens aunque no haya nada nuevo (95% de heartbeats son HEARTBEAT_OK)

---

## Target State (Post-N8N)

**N8N workflows corren cada hora:**
- ✅ Bitcoin node status → Solo alerta si problema
- ✅ LND status → Solo alerta si problema
- ✅ System resources → Solo alerta si >90% disk
- ✅ Nostr notifications → Solo alerta si menciones/replies
- ✅ Conversation backup → Cada 6h, sin tokens

**Claude heartbeat (cada 60 min) SOLO ejecuta:**
1. Check nightshift-wakeup.txt
2. Check Daniel unread messages
3. **Check n8n alerts** (nuevo)
4. Execute Task Queue

**Ahorro:** 95% tokens en heartbeats normales

---

## Implementation Checklist

### Paso 1: N8N Workflows (DANIEL)
- [ ] Crear Workflow 1: Heartbeat Health Checks
- [ ] Crear Workflow 2: Conversation Backup
- [ ] Crear Workflow 3: Nostr Notifications
- [ ] Activar workflows (toggle ON)
- [ ] Verificar primeras ejecuciones

### Paso 2: OpenClaw Webhook (CLAUDIO + DANIEL)
- [ ] Generar token seguro (`openssl rand -hex 32`)
- [ ] Añadir webhook config a gateway
- [ ] Actualizar workflows n8n con token
- [ ] Test webhook con curl

### Paso 3: Update HEARTBEAT.md (CLAUDIO)
- [ ] Eliminar checks que hace n8n
- [ ] Añadir "Check n8n alerts"
- [ ] Documentar nuevo flujo

### Paso 4: Monitoring (CLAUDIO)
- [ ] Verificar workflows corren cada hora (n8n executions)
- [ ] Confirmar no hay errores
- [ ] Medir ahorro tokens (compare 24h pre vs post)

---

## Rollback Plan

Si n8n workflows fallan:
1. Revertir HEARTBEAT.md a versión actual
2. Deshabilitar workflows n8n
3. Volver a checks manuales en heartbeat

---

**Created:** 2026-02-07 14:18 UTC  
**Status:** Pending n8n implementation by Daniel
