# Lightning Event Monitoring - Architecture

## CRÍTICO: Separación de Eventos

**NUNCA mezclar eventos del nodo directo con eventos del bot custodial.**

## 1. Nodo LND Directo (ClaudioNode⚡)

**Fuente:** LND de Claudio (`/home/neo/lnd-linux-amd64-v0.20.0-beta/`)

**Eventos a monitorear:**
- Invoice settled (pagos recibidos de peers directos)
- Payments sent (pagos enviados a peers directos)
- Channel opened/closed
- Routing fees earned
- Peer connections
- Channel balance changes

**Destino de notificaciones:**
- ✅ OpenClaw (esta sesión) - reportar a Claudio
- ✅ Canal Telegram ADMIN separado (solo Daniel + Claudio)
- ❌ NUNCA al bot custodial público

**Ejemplos:**
- "Daniel te pagó 5000 sats" → notificación privada
- "Nuevo canal abierto con X" → notificación privada
- "Earned 10 sats routing fees" → notificación privada

## 2. Bot Custodial (Lightning Easy Bot)

**Fuente:** El mismo LND, pero pagos identificados como usuarios del bot

**Eventos a monitorear:**
- Usuario deposita (paga invoice generado por el bot)
- Usuario retira (bot paga invoice del usuario)
- Transacciones entre usuarios (internamente en DB, no LND)
- Faucets, giveaways, tips entre usuarios

**Destino de notificaciones:**
- ✅ Canal Telegram ADMIN separado
- ✅ Logs del bot
- ❌ NUNCA visible a usuarios normales del bot

**Ejemplos:**
- "Usuario @alice depositó 10K sats" → canal admin
- "Usuario @bob retiró 5K sats" → canal admin
- "@alice tipeó 100 sats a @bob" → solo logs (no notificación)

## 3. Diferenciación Técnica

### ¿Cómo distinguir eventos?

**Invoices del nodo directo:**
- Memo NO contiene user_id del bot
- No hay registro en `bot.db` tabla `pending_invoices`
- Payment_addr no está en tracking del bot

**Invoices del bot custodial:**
- ✅ Registro en `bot.db` tabla `pending_invoices`
- ✅ Tiene `telegram_id` asociado
- ✅ El bot esperaba ese pago

**Payments salientes:**
- Nodo directo: pagos a otros Lightning nodes (peers)
- Bot custodial: withdrawals (usuarios retirando fondos)

## 4. Canales de Notificación

### Opción A: OpenClaw (actual)
- Eventos del nodo → reporto a Claudio vía esta sesión
- Requiere que OpenClaw esté activo
- Limitación: si compacto contexto, pierdo el hilo

### Opción B: Canal Telegram Admin Separado
```
Crear grupo Telegram: "ClaudioNode Admin"
Miembros: Daniel + bot admin
Notificaciones:
- Eventos nodo directo
- Eventos bot custodial (admin level)
- Alertas de sistema
```

### Opción C: Híbrido
- Eventos críticos → Telegram admin
- Eventos informativos → logs + reportes en heartbeats
- Métricas → dashboard (futuro)

## 5. Implementación Segura

### Monitor para Nodo Directo
```javascript
// Polling listinvoices
// Filtrar: solo invoices SIN registro en bot.db
// Notificar: canal admin o OpenClaw
```

### Monitor para Bot Custodial
```javascript
// Ya implementado en bot.js (monitorInvoices())
// Filtra: solo invoices EN bot.db (pending_invoices)
// Notificar: canal admin (NO bot público)
```

## 6. Reglas de Oro

1. **NUNCA exponer info del nodo directo al bot público**
2. **NUNCA exponer info de usuarios a otros usuarios**
3. **Separar canales: admin ≠ público**
4. **Logs detallados de TODO (audit trail)**
5. **Rate limiting en notificaciones admin (evitar spam)**

## 7. Caso de Uso: El Error de Hoy

**Lo que hice mal:**
```javascript
// monitor-invoices.mjs
sendTelegram(message); // Envió a BOT_TOKEN (público)
```

**Resultado:**
- Mensaje "PAGO RECIBIDO 5000 sats" apareció en bot público
- Era un pago privado Daniel → Claudio
- Los usuarios del bot lo habrían visto (confusión + privacy leak)

**Lo correcto:**
```javascript
// Opción 1: Notificar a OpenClaw (interno)
console.log("Payment received, report in next heartbeat");

// Opción 2: Canal admin separado
sendTelegramAdmin(message, ADMIN_CHANNEL_ID);
```

## 8. Próximos Pasos

- [ ] Decidir: ¿OpenClaw reporting o canal Telegram admin?
- [ ] Si Telegram: crear grupo admin + bot token separado
- [ ] Implementar monitor de nodo directo (sin mezclar con bot)
- [ ] Añadir notificaciones admin al bot custodial (eventos usuarios)
- [ ] Documentar qué eventos notificar vs solo loggear

---

**Lección aprendida:** Separación de contextos es CRÍTICA. No asumir, no implementar a lo loco. Preguntar primero, implementar después.

**Status:** Documentado, NO implementado (esperando decisión de arquitectura)
