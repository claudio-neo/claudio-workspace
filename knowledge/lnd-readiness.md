# LND Readiness Assessment

## Current Status (2026-02-01)
- **Bitcoin IBD:** 90.24% (888,805/934,573 bloques)
- **ETA para completar:** ~2-3 días
- **LND versión:** v0.20.0-beta
- **LND status:** Instalado, configurado, NO corriendo (esperando IBD)

## Configuración Actual

### Bitcoin Node
```
prune=550          # Mínimo, podría causar issues con LND
txindex=0          # Sin indexación (routing nodes la necesitan)
dbcache=2048       # Bueno para IBD
maxconnections=40  # OK
zmqpubrawblock=tcp://127.0.0.1:28332  # ✅ Requerido por LND
zmqpubrawtx=tcp://127.0.0.1:28333     # ✅ Requerido por LND
```

### LND Config
```
alias=ClaudioNode
color=#e01b24
bitcoin.active=1
bitcoin.mainnet=1
bitcoin.node=bitcoind
autopilot.active=0    # Manual channel management
tor.active=0          # Clearnet por ahora
```

## Compatibilidad Bitcoin Pruned + LND

### Según docs oficiales (lightning.engineering):
- ✅ "You may prune your Bitcoin node"
- ⚠️ "though doing so aggressively may impact performance"
- ❌ Routing nodes: "will not aggressively prune their Bitcoin backend"
- ❌ Routing nodes: recomiendan `txindex=1`

### Análisis:
- Nuestro prune=550 ES agresivo (mínimo de Bitcoin Core)
- Para un **nodo personal** (no routing profesional): debería funcionar
- Para **routing de pagos**: necesitaríamos nodo completo con txindex
- Problema potencial: LND podría necesitar bloques que ya fueron podados

### Limitaciones con pruned node:
1. No puede servir como fuente de histórico para otros nodos
2. Puede tener problemas al rescannear para encontrar fondos
3. Channel opens/closes pueden fallar si necesita bloques podados
4. No puede indexar transacciones antiguas

## Recursos del Servidor

### RAM (15GB total)
- bitcoind: ~5GB (31.5%)
- next-server (neofreight): ~2.2GB (13.5%)
- Kafka: ~0.9GB (5.8%)
- Ollama: ~0.8GB (4.9%)
- openclaw-gateway: ~0.7GB (4.1%)
- Keycloak: ~0.4GB (2.4%)
- Disponible: ~4GB

### LND Requirements
- Mínimo: 2GB RAM
- Recomendado: 4GB+ para routing
- Con 4GB disponibles: **ajustado pero viable** para nodo personal

### Disco
- Usado: 90GB/464GB (20%)
- Bitcoin pruned: 13GB (estable con prune)
- LND database: ~1-5GB (depende de canales)
- **Espacio suficiente**

## Plan de Lanzamiento

### Pre-requisitos
1. [ ] Esperar a que IBD termine (verificationprogress > 0.9999)
2. [ ] Reducir dbcache de bitcoind (de 2048 a 512) para liberar RAM para LND
3. [ ] Verificar que ZMQ funciona correctamente
4. [ ] Crear wallet de LND

### Día de Lanzamiento
1. Reducir bitcoind dbcache: editar bitcoin.conf, restart bitcoind
2. Iniciar LND: `/home/neo/lnd-linux-amd64-v0.20.0-beta/lnd`
3. Crear wallet: `lncli create` (seed phrase → guardar OFFLINE)
4. Esperar sync de LND (puede tomar horas)
5. Verificar con `lncli getinfo`

### Post-Lanzamiento
1. Configurar systemd service para auto-start
2. Abrir primer canal (con nodo bien conectado, >1M sats)
3. Monitorear logs por errores
4. Configurar backup automático de channel.db

## Decisiones Pendientes (para Daniel)
- **¿Routing o solo pagos?** Si routing → necesitamos despodar
- **¿Fondos?** Necesitamos BTC para abrir canales
- **¿Tor?** Activar para privacidad
- **¿Backup?** Canal de backup automático a dónde

---

*Creado: 2026-02-01 08:43 UTC*
*Fuentes: lightning.engineering docs, LND GitHub issues*
