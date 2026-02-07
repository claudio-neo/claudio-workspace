# Análisis de Impacto - Caddyfile Neofreight

**Fecha:** 2026-02-07 08:19 UTC  
**Motivo:** Caddyfile corrupto con caracteres, reemplazo por versión limpia

## Backup Realizado
✅ `backup-caddyfile-corrupto-20260207-081923.txt` (workspace)

## Comparación Versión Limpia vs. Actual

### Versión Limpia (origin/main - commit 6de25c4)
```caddy
neofreight.net, www.neofreight.net {
    import ../../../calamardo/infra/caddy/calamardo_routes.caddy

    # ClawdBoard (protected) - redirect to trailing slash for relative asset paths
    @clawdboard path /clawdboard
    redir @clawdboard /clawdboard/ permanent

    handle /clawdboard/* {
        basicauth {
            Claudio $2a$14$MMKS/50viFtCJnDPBvxpE.GsQkdsopex.QoUM4IQV8IavBnBHafgG
        }
        uri strip_prefix /clawdboard
        reverse_proxy localhost:18789
    }

    reverse_proxy localhost:3000
}
import neofreight_domains.caddy
```

**NOTA:** origin/main YA TIENE la mejora de ClawdBoard (commit 361bef9).

### Versión Actual (local, modificada)
**Diferencia vs. origin/main:**

✅ **ClawdBoard:** IDÉNTICO (origin/main ya tiene mejora)  
🔴 **LNURL-pay routes:** SOLO EN LOCAL (añadidos por Claudio)

```caddy
# LNURL-pay / Lightning Address (Claudio's LN node)
handle /.well-known/lnurlp/* {
    reverse_proxy localhost:8090
}
handle /lnurlp/* {
    reverse_proxy localhost:8090
}
```

**Resumen:** La única diferencia es LNURL-pay routes. Todo lo demás es igual.

## Servicios de Claudio Afectados

### 🔴 CRÍTICO - Se PERDERÁ con versión limpia:
1. **Lightning Address (claudio@neofreight.net)**
   - Servicio: LNURL-pay server (puerto 8090)
   - Rutas: `/.well-known/lnurlp/*` y `/lnurlp/*`
   - Impacto: Lightning Address DEJARÁ DE FUNCIONAR
   - Usado en: Perfil Nostr, recepción de zaps, identidad Lightning
   - **Esto es lo ÚNICO que se pierde**

### ✅ NO AFECTADO:
2. **ClawdBoard (neofreight.net/clawdboard/)**
   - Servicio: Dashboard Lightning bot (puerto 18789)
   - Impacto: NINGUNO (origin/main ya tiene la mejora)
   - Severity: Sin cambios

## Servicios NO Afectados
✅ Calamardo routes (importados, no cambian)  
✅ Neofreight frontend (localhost:3000)  
✅ Subdominios API/Auth (import separado)

## Recomendación

**ANTES de aplicar versión limpia:**
1. ✅ Backup completado
2. Documentar rutas LNURL-pay para re-aplicar después

**DESPUÉS de aplicar versión limpia:**
1. **Re-añadir LNURL-pay routes** (OBLIGATORIO)
2. Opcionalmente re-añadir mejora ClawdBoard routing

## Diff a Re-aplicar (CRÍTICO)

```diff
+    # LNURL-pay / Lightning Address (Claudio's LN node)
+    handle /.well-known/lnurlp/* {
+        reverse_proxy localhost:8090
+    }
+    handle /lnurlp/* {
+        reverse_proxy localhost:8090
+    }
```

**NOTA:** Sin estas rutas, `claudio@neofreight.net` Lightning Address NO funcionará.

---

**Preparado por:** Claudio  
**Para:** Daniel  
**Acción:** Revisar antes de aplicar versión limpia
