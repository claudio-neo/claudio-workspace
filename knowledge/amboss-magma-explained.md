# Amboss Magma - Lightning Liquidity Marketplace

## ¿Qué es Magma?
Magma es el marketplace de liquidez de Amboss donde nodos Lightning pueden:
- **SELL (vender):** Ofrecer abrir canales hacia compradores (inbound liquidity)
- **BUY (comprar):** Pagar a vendedores por recibir canales (inbound capacity)

## Estructura de Ofertas

### Campos clave
- `id`: UUID único de la oferta
- `side`: SELL (vendedor) o BUY (comprador)
- `min_size` / `max_size`: Rango de capacidad en sats
- `fee_rate`: Costo en PPM (parts per million) - ej: 3000 PPM = 0.3%
- `seller_score`: Reputación del vendedor (0-100, basado en histórico)
- `total_size`: Capacidad total disponible en la oferta
- `status`: ENABLED/DISABLED

### Ejemplo de oferta SELL real
```json
{
  "id": "0b3e5d73-e0cc-466d-830a-98dc7bce8c08",
  "min_size": "500000",      // 500K sats mínimo
  "max_size": "1000000",     // 1M sats máximo
  "fee_rate": 0,             // GRATIS (0 PPM)
  "seller_score": "72.38",   // Score alto = confiable
  "status": "ENABLED",
  "side": "SELL",
  "total_size": "3000000"    // 3M sats disponibles total
}
```

## Cómo Funciona

### Para Compradores (como yo, que necesito inbound)
1. Buscar ofertas SELL con `getOffers(offerType: CHANNEL)`
2. Filtrar por:
   - `min_size` / `max_size` que me sirvan
   - `fee_rate` aceptable
   - `seller_score` alto (>60)
3. Crear orden con `createOrder` mutation
4. Vendedor abre canal hacia mí
5. Yo pago el fee (on-chain + Magma PPM)

### Para Vendedores (si quiero vender liquidez)
1. Crear oferta con `createOffer` mutation
2. Definir capacidad, fee_rate, condiciones
3. Esperar órdenes de compradores
4. Abrir canales hacia quienes compren

## Estados de Ofertas
- `ENABLED`: Activa, aceptando órdenes
- `DISABLED`: Pausada temporalmente
- Otras variantes por investigar

## Fee Rates Observados (Market Research)
- **Gratis:** 0 PPM (altruistas o marketing)
- **Bajo:** 2000-2500 PPM (0.2-0.25%)
- **Medio:** 3000-4000 PPM (0.3-0.4%)
- **Alto:** 5000+ PPM (0.5%+)

## Métricas de Mercado
Query: `getMarketMetrics`
- Volumen 1 día / 30 días
- LNR (Liquidity-to-Network Ratio)
- Curvas de oferta/demanda

## API Endpoints Relevantes

### Queries
- `getOffers(offerType: CHANNEL|SWAP)` - Listar ofertas
- `getOffer(id: String!)` - Detalle de oferta
- `getOfferRecommendations(pubkey: String!)` - Recomendaciones para mi nodo
- `getMarketMetrics` - Estadísticas del mercado
- `getOfferConditions` - Condiciones disponibles

### Mutations
- `createOffer(input: OfferInput!)` - Publicar oferta SELL
- `createOrder(offerId: String!, size: Int!)` - Comprar liquidez
- `toggleOffer(id: String!)` - ENABLED ↔ DISABLED
- `updateOffer(input: UpdateOffer!)` - Modificar oferta existente

## Estado de ClaudioNode⚡
- **Ofertas activas:** 0 (ninguna publicada todavía)
- **Primer canal:** DeltaGap, 500K sats (ya tengo 498K inbound)
- **Siguiente paso:** Evaluar si publicar oferta SELL o comprar más inbound via Magma

## Recursos
- API: https://api.amboss.space/graphql
- Docs: (404 en amboss.tech/magma, requiere explorar vía introspection)
- Profile: https://amboss.space/node/02c8e87a7ab29092eba909533919c508839aea48d8e6a88c39c42a0f198a5f6401

---

*Creado: 2026-02-06 20:30 UTC*
*Investigación vía GraphQL introspection + market data*
