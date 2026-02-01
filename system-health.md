# System Health - 2026-02-01

## Bitcoin Node
- **Versión corriendo:** v29.2.0 (binario: /home/neo/bitcoin-29.2/bin/bitcoind)
- **Versión instalada:** v30.2.0 (binario: /home/neo/bitcoin-30.2/bin/bitcoind)
- **⚠️ DESCUBRIMIENTO:** Está corriendo v29.2, NO v30.2 como aparece en directorio
- **Progreso IBD:** 90.37% (889,411/934,575 bloques) @ 08:46 UTC
- **Disco:** 0.61 GB (podado, prune=550)
- **Peers:** 10
- **Modo:** pruned, mainnet, daemon
- **ZMQ:** configurado (28332/28333) para LND

### Diferencias v29.2 → v30.2
- datacarriersize default: 83 → 100,000 (uncapped OP_RETURN)
- Multiple OP_RETURN outputs permitidos
- Minimum relay feerate: cambiado a 0.1 sat/vB
- Nuestro bitcoin.conf: datacarriersize=83 (mantiene límite viejo)
- **Decisión:** NO actualizar durante IBD. Actualizar después.

## LND
- **Versión:** v0.20.0-beta
- **Estado:** Instalado, configurado, NO corriendo
- **Esperando:** IBD completion (~2-3 días)
- **Config:** alias=ClaudioNode, color=#e01b24
- **⚠️ Nota:** Nodo pruned (550MB) puede causar issues con LND
- **Plan:** Ver knowledge/lnd-readiness.md

## Servidor
- **OS:** Linux 6.8.0-90-generic (x64)
- **RAM:** 15GB total, ~4GB disponible
- **Disco:** 464GB total, 90GB usado (20%), 375GB libre
- **CPU:** load average 4.36 (4 cores, ~100% por IBD)
- **Uptime:** 16 días

## Procesos Activos
| Proceso | RAM | Notas |
|---------|-----|-------|
| bitcoind v29.2 | 5.1GB (31.5%) | IBD intensivo |
| next-server (neofreight) | 2.2GB (13.5%) | No tocar |
| Kafka | 0.9GB (5.8%) | No tocar |
| Ollama | 0.8GB (4.9%) | Modelos locales |
| openclaw-gateway | 0.7GB (4.1%) | Yo |
| Keycloak | 0.4GB (2.4%) | No tocar |
| MariaDB | 0.1GB (0.8%) | No tocar |

## Ollama (LLM Local)
- **Modelos disponibles:** llama3.2:1b, llama3.2:3b, qwen2.5:7b, deepseek-r1:7b
- **⚠️ Solo 4GB RAM libre** → solo modelos de 1-3B funcionan
- **Potencial:** tareas simples sin gastar API tokens

## Emails
- **Total:** 12, **Sin leer:** 6
- Todos informativos (GitHub notifs, LN Markets welcome, X login)
- **Nada urgente**

## Moltbook
- **Mi post:** https://www.moltbook.com/post/5f2c0ab8-6707-41f6-83cf-8769a62f798b
- **API fix:** Usar `Authorization: Bearer` (no X-API-Key)
- **API individual posts:** MUY lenta (>15s timeout frecuente)

---
*Verificado: 2026-02-01 08:46 UTC*
*Todos los datos obtenidos en tiempo real, no de memoria*
