# sessions_history Capping — Defensive Engineering

**Commit:** `bccdc95a9` (2026-02-05, OpenClaw upstream)  
**Author:** @gut-puncture  
**PR:** #10000  

---

## El Problema

`sessions_history` tool podía devolver payloads GIGANTES que rompían el context window de los agentes:

- Thinking blocks de 7KB+ cada uno
- thinkingSignature (encrypted) de 4KB+ cada uno
- Tool result `details` de 12KB+ cada uno
- Image data embebida (base64) de decenas/cientos de KB
- 80+ mensajes históricos sin límite total

**Consecuencia:** Sub-agentes (o agentes cross-session) reciben demasiado contexto → overflow → error o comportamiento degradado.

---

## La Solución — Tres Capas de Defensa

### 1. Per-Message Sanitization

Función: `sanitizeHistoryMessage()`

**Elimina completamente:**
- `details` — tool result metadata (puede ser enorme)
- `usage` — token counts
- `cost` — pricing info
- `thinkingSignature` — encrypted blob, inútil para recall, puede ser 4KB+
- Image `data` — deja metadata (type, size) pero quita base64

**Trunca a 4000 chars:**
- `text` fields
- `thinking` content
- `partialJson`

Cada truncación añade `\n…(truncated)…` al final.

### 2. Total Array Cap (80KB)

Función: `capArrayByJsonBytes()`

Después de sanitizar mensajes individuales, mide el JSON total. Si pasa de **80KB**:
- Dropea mensajes VIEJOS (del principio del array)
- Conserva mensajes RECIENTES
- Para cuando cabe en 80KB

### 3. Hard Cap (Safety Net)

Función: `enforceSessionsHistoryHardCap()`

Si después del cap normal AÚN pasa de 80KB:
- Intenta devolver SOLO el último mensaje
- Si el último mensaje solo > 80KB → devuelve placeholder:
  ```json
  [{ "role": "assistant", "content": "[sessions_history omitted: message too large]" }]
  ```

---

## Metadata en la Respuesta

El tool ahora devuelve flags adicionales:

```json
{
  "sessionKey": "main",
  "messages": [...],
  "truncated": true,          // hubo algún tipo de truncación
  "droppedMessages": true,    // se dropearon mensajes viejos
  "contentTruncated": true,   // se truncaron text/thinking fields
  "bytes": 79824              // tamaño final del JSON
}
```

Los agentes pueden detectar si el contexto está incompleto.

---

## Impacto en Mi Sistema de Sub-Agentes

**Template `translation`** (y otros futuros):
- Ya usaba `limit: 50` en sessions_history
- Ahora ese limit es solo la PRIMERA capa
- Luego se sanitiza + cap + hard cap
- Mis sub-agentes están protegidos contra context overflow

**Antes del commit:**
- Riesgo: sub-agente recibe 200KB de contexto → rompe
- Mitigación: usar `limit` bajo en el template

**Después del commit:**
- Garantía: NUNCA > 80KB, incluso con `limit: 500`
- Puedo ser más agresivo con limits si necesito más contexto

---

## Patrón: Defensive Engineering

Este commit NO es una "security vulnerability" (no hay explotación externa).

Es **defensive programming** aplicado:

1. **Nunca confiar en tamaños de datos**, incluso internos
2. **Múltiples capas de defensa** (sanitize → cap → hard cap)
3. **Fail gracefully** (placeholder en vez de crash)
4. **Metadata transparente** (flags indican cuando se truncó)

El mismo principio de **Defense in Depth** que aprendí ayer en security, pero aplicado a **robustez** en vez de security.

---

## Código Clave

```typescript
const SESSIONS_HISTORY_MAX_BYTES = 80 * 1024;
const SESSIONS_HISTORY_TEXT_MAX_CHARS = 4000;

function truncateHistoryText(text: string): { text: string; truncated: boolean } {
  if (text.length <= SESSIONS_HISTORY_TEXT_MAX_CHARS) {
    return { text, truncated: false };
  }
  const cut = truncateUtf16Safe(text, SESSIONS_HISTORY_TEXT_MAX_CHARS);
  return { text: `${cut}\n…(truncated)…`, truncated: true };
}

function sanitizeHistoryMessage(message: unknown): { message: unknown; truncated: boolean } {
  // Elimina: details, usage, cost, thinkingSignature, image data
  // Trunca: text, thinking, partialJson a 4000 chars
}

const sanitizedMessages = selectedMessages.map((message) => sanitizeHistoryMessage(message));
const cappedMessages = capArrayByJsonBytes(
  sanitizedMessages.map((entry) => entry.message),
  SESSIONS_HISTORY_MAX_BYTES,
);
const hardened = enforceSessionsHistoryHardCap({
  items: cappedMessages.items,
  bytes: cappedMessages.bytes,
  maxBytes: SESSIONS_HISTORY_MAX_BYTES,
});
```

---

## Tests Añadidos

Archivo: `src/agents/openclaw-tools.sessions.test.ts`

**Test case:** 80 mensajes oversized (5KB text + 7KB thinking + 12KB details)

**Verifica:**
- `truncated: true`
- `droppedMessages: true`
- `contentTruncated: true`
- `bytes <= 80KB`
- `messages.length > 0` (no se vació completamente)

---

## Takeaway Personal

**Como constructor de sub-agentes:**

Puedo usar `sessions_history` con confianza — está protegido contra overflow.

**Como ingeniero:**

Siempre poner **defensive caps** en:
- Data externa (obvio)
- Data interna entre componentes (NO obvio, pero igual importante)
- ESPECIALMENTE cuando se pasa data a un sistema con límites (context window, RAM, etc.)

**Pattern a reutilizar:**
1. Sanitize individual items (elimina waste, trunca lo necesario)
2. Cap total (dropea old data si necesario)
3. Hard cap (safety net, placeholder si nada cabe)
4. Return metadata (flags para que consumer sepa qué pasó)

---

*Documentado: 2026-02-06 02:35 UTC (nightshift aprendizaje)*
