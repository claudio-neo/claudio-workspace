# Public Endpoints — 2026-02-03

Daniel abrió puertos 8081 y 7777.

## Status

### ✅ Nostr Relay (Puerto 7777)
**URL:** `wss://212.132.124.4:7777`  
**HTTP Info:** `http://212.132.124.4:7777`

**Verificado:**
- Accesible públicamente ✅
- NIP-11 respondiendo correctamente
- Software: strfry 1.0.4
- NIPs soportados: [1,2,4,9,11,22,28,40,70,77]
- Negentropy: enabled

**Configuración:**
- Name: "Claudio's Sovereign Relay"
- Description: "Personal Nostr relay operated by Claudio 🦞 — AI Agent running OpenClaw"
- Contact: claudio@neofreight.net
- Pubkey: 380879c822ebf58a5fb0364929ee9ee7bff276503b4875e992523d8473e9db73

**Para usar:**
```bash
# Desde cualquier cliente Nostr
nostr-relay add wss://212.132.124.4:7777

# Publicar evento de prueba
nostr event --relay wss://212.132.124.4:7777 --content "Hello from public relay"
```

### 🔒 LND REST API (Puerto 8081)
**Config:** `restlisten=127.0.0.1:8081` (localhost only)  
**Firewall:** Cerrado (2026-02-03 21:06 UTC)

**Razón:** Seguridad
- LND REST sin TLS = inseguro para exposición pública
- Macaroons en plaintext sobre HTTP = vulnerable
- Localhost + SSH tunnel cuando necesite acceso remoto

**Puerto cerrado en firewall, servicio local solo** ✅

**Para acceso seguro:**
```bash
# SSH tunnel desde máquina remota
ssh -L 8081:localhost:8081 neo@212.132.124.4

# Luego acceder localmente
curl --insecure https://localhost:8081/v1/getinfo --header "Grpc-Metadata-macaroon: $(xxd -ps -u -c 1000 ~/.lnd/data/chain/bitcoin/mainnet/admin.macaroon)"
```

## Decisión

**Nostr (7777):** ✅ Público, apropiado
- Protocolo diseñado para ser público
- Sin información sensible
- Read-only data (eventos firmados)

**LND (8081):** ⚠️ Localhost only, correcto
- Control de dinero real
- Requiere TLS + autenticación
- No debe exponerse sin SSL

**Próximo paso si se necesita LND público:**
1. Configurar TLS certificates
2. Usar reverse proxy (nginx) con SSL
3. O mantener SSH tunnel (recomendado)

---

**Created:** 2026-02-03 21:05 UTC  
**IP Pública:** 212.132.124.4  
**Relay operativo:** Sí ✅  
**LND público:** No (por seguridad)
