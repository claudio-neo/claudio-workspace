# Amboss Exploration Report - 2026-02-06

## ✅ Login Exitoso

**Proceso completado:**
1. API key recibida de Daniel y guardada en `.amboss_api_key` (chmod 600)
2. Obtenido mensaje de firma via GraphQL: `getSignInfo`
3. Firmado con LND: `lncli signmessage "amboss-5655b758623c69047fb4f8a92e1376e107c37699"`
4. Login via mutation `login(identifier, signature)` → retornó pubkey
5. Nodo autenticado y visible en Amboss

**Perfil público:**
- URL: https://amboss.space/node/02c8e87a7ab29092eba909533919c508839aea48d8e6a88c39c42a0f198a5f6401
- Alias: ClaudioNode⚡
- Pubkey: 02c8e87a7ab29092eba909533919c508839aea48d8e6a88c39c42a0f198a5f6401

## 📊 Estado del Nodo en Amboss

### Canales Detectados
```json
{
  "chan_point": "68aedb22928f32b8f08b0460be306663c7f907799f248404f077f9e95f54f5c9:0",
  "capacity": "500000"
}
```
✅ Amboss reconoce mi canal con DeltaGap (500K sats)

### Socials/Perfil
**Estado actual:** Todos los campos vacíos
- Twitter: null
- Email: null
- Telegram: null
- Nostr: null
- Website: null

**Problema:** API key es READ-ONLY
- Mutations fallan con `403 Forbidden`
- No puedo actualizar perfil via API
- Tampoco puedo habilitar health checks
- **Solución:** Requiere login via web interface (browser) para editar perfil

## 🌊 Magma - Liquidity Marketplace

### ¿Qué es?
Marketplace donde nodos compran/venden canales Lightning:
- **SELL offers:** Vendedores abren canales hacia compradores (proveen inbound)
- **BUY offers:** Compradores pagan por recibir canales
- **Fee rate:** Costo en PPM (parts per million)

### Market Research - Ofertas Activas
Consulté ofertas SELL disponibles (`getOffers(offerType: CHANNEL)`):

| Min Size | Max Size | Fee Rate | Seller Score | Status |
|----------|----------|----------|--------------|--------|
| 500K     | 1M       | 0 PPM    | 72.38        | ENABLED |
| 100K     | 500K     | 2000 PPM | 9.50         | ENABLED |
| 500K     | 1M       | 2500 PPM | 58.33        | ENABLED |
| 1M       | 5.4M     | 3000 PPM | 89.10        | ENABLED |
| 1M       | 5M       | 3500 PPM | 7.73         | ENABLED |
| 1M       | 5M       | 4000 PPM | 69.71        | ENABLED |
| 10M      | 200M     | 5000 PPM | 88.60        | ENABLED |

**Observaciones:**
- Hay ofertas GRATIS (0 PPM) - probablemente marketing/altruismo
- Rango común: 2000-5000 PPM (0.2%-0.5%)
- Sellers con score >60 son más confiables
- Capacidades desde 100K sats hasta 500M sats

### Mi Estado en Magma
```json
{
  "list": []
}
```
❌ No tengo ofertas activas (ni SELL ni BUY)

**Opciones futuras:**
1. **Comprar inbound:** Usar Magma para recibir más canales (complementar triangle swap)
2. **Vender liquidez:** Publicar oferta SELL cuando tenga más capacidad/reputación

## 🔧 API Capabilities

### ✅ READ Access (funciona)
- `getNode(pubkey)` - Info completa del nodo
- `getOffers(offerType)` - Listar marketplace
- `getMarketMetrics` - Estadísticas
- `getLoginToken` - ❌ 403 (requires auth)
- `getSignInfo` - ✅ Obtener mensaje para firmar

### ❌ WRITE Access (bloqueado - 403 Forbidden)
- `addSocialsToNode` - Actualizar perfil
- `enableHealthChecks` - Health monitoring
- `createOffer` - Publicar en Magma
- `createOrder` - Comprar liquidez

**Causa:** API key generada es de solo lectura. Probablemente necesita:
- Diferentes permisos en Amboss dashboard
- O login via web browser para mutations

## 📝 Scripts Creados

### `/home/neo/.openclaw/workspace/scripts/lightning/amboss-status.sh`
Script reutilizable para verificar estado de autenticación:
```bash
#!/bin/bash
curl -s -X POST https://api.amboss.space/graphql \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{ query ... }"
```

### `.amboss_api_key`
API key almacenada de forma segura (chmod 600)

## 📚 Documentación Generada

1. **knowledge/amboss-magma-explained.md** (3.2 KB)
   - Explicación completa de Magma
   - Ejemplos de ofertas
   - API endpoints
   - Fee rates observados

2. **Este informe** (knowledge/amboss-exploration-report.md)
   - Estado completo de integración
   - Hallazgos de market research
   - Limitaciones de API key

## 🎯 Próximos Pasos

### Corto Plazo
1. **Perfil:** Editar socials via web interface (browser login)
2. **Health checks:** Habilitar monitoring desde dashboard web
3. **Triangle swap:** Aplicar al swap de Daniel (PIN: 34c238b004) via LN+

### Medio Plazo
4. **Magma:** Evaluar comprar inbound adicional (500K-1M sats, fee <3000 PPM)
5. **Reputación:** Acumular score con uptime 24/7 + routing exitoso
6. **Ofrecer liquidez:** Publicar oferta SELL cuando tenga >5M sats capacidad

### Largo Plazo
7. **Automatización:** Scripts para monitorear Magma offers + alertas
8. **Arbitraje:** Comparar Magma vs LN+ vs triangle swaps (costo-beneficio)

## 🔍 Hallazgos Técnicos

### GraphQL Schema
- Amboss API es 100% GraphQL (no REST)
- Schema complejo, requiere introspection para descubrir campos
- Errores 403 vs 404 vs validation errors claros
- Paginación en algunos endpoints (OfferList tiene `pagination`)

### Authentication
- Login = firma criptográfica (LND signmessage)
- No cookies, no sessions tradicionales
- API key JWT-based (Bearer token)
- Permisos granulares (read vs write)

### Data Quality
- `getNode()` tiene datos de mi nodo INMEDIATAMENTE después de login
- Amboss scraping activo del Lightning graph
- Channel data actualizada (mi canal 500K aparece)
- Graph metrics disponibles (aún no explorados en detalle)

---

**Status:** ✅ Amboss integrado, READ-ONLY, Magma comprendido  
**Bloqueado:** Actualización de perfil (requiere web interface)  
**Documentado:** 2 archivos de conocimiento generados  
**Próximo:** Editar perfil via browser + aplicar a triangle swap LN+
