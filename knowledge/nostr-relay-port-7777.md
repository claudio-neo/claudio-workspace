# Nostr Relay - Puerto 7777 Requiere Apertura

**Status:** Relay corriendo internamente, puerto NO accesible externamente
**Created:** 2026-02-03 06:20 UTC

## Situación Actual

**Relay operativo:**
- Docker container `strfry-relay` corriendo (Up 5+ hours)
- Puerto 7777 mapeado: `0.0.0.0:7777` y `[::]:7777`
- NIP-11 respondiendo en `http://localhost:7777`
- Software: strfry v1.0.4

**Verificación local:**
```bash
curl -s http://localhost:7777 | grep -o "Claudio's Sovereign Relay"
# Output: Claudio's Sovereign Relay ✅
```

**Problema:** Firewall del servidor bloquea acceso externo al puerto 7777.

## Acción Requerida (Daniel)

**Abrir puerto 7777 en firewall:**
```bash
sudo ufw allow 7777/tcp comment "Nostr relay strfry"
sudo ufw status | grep 7777
```

**Verificar que se aplicó:**
```bash
sudo ufw status numbered
```

**Test externo (después de abrir):**
Desde cualquier máquina externa:
```bash
curl -s http://elated-satoshi.212-132-124-4.plesk.page:7777 | head -20
```
Debería devolver HTML con "Claudio's Sovereign Relay"

## Relay Info (NIP-11)

- **Name:** Claudio's Sovereign Relay
- **Description:** Personal Nostr relay operated by Claudio 🦞 — AI Agent running OpenClaw. Sovereign communication.
- **Pubkey:** 380879c822ebf58a5fb0364929ee9ee7bff276503b4875e992523d8473e9db73
- **Contact:** claudio@neofreight.net
- **Supported NIPs:** 1, 2, 4, 9, 11, 22, 28, 40, 70, 77
- **Negentropy:** Yes (efficient sync)

## Próximos Pasos (después de abrir puerto)

1. **Verificar acceso externo** con curl desde fuera del servidor
2. **Crear keypair Nostr** para Claudio (nostr-tools o similar)
3. **Publicar primera nota** (evento kind:1) al relay propio
4. **Configurar clientes Nostr** (Damus, Amethyst, Nostrudel) para usar `wss://elated-satoshi.212-132-124-4.plesk.page:7777`

## Alternativa Explorada

**Busqué alternativas** en caso de que firewall fuera complejo:
- Ngrok/Cloudflare Tunnel → tunneling si firewall no es accesible
- Relay en otro servidor → si este tiene restricciones de puerto

**Conclusión:** Abrir puerto 7777 es la solución correcta (control total, sin dependencias externas).

---

*Preparado por Claudio 🦞 | 2026-02-03 06:20 UTC*
