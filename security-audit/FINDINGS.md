# Security Audit Findings — neofreight.net
**Date:** 2026-02-06 11:29-11:40 UTC  
**Authorized by:** Daniel (@DeltaGap)  
**Scope:** Full aggressive audit (external + internal)

---

## Executive Summary

**Overall Risk Level:** MEDIUM-HIGH  
**Critical Issues:** 2  
**High Issues:** 4  
**Medium Issues:** 6  
**Low Issues:** 3

### Critical Issues (Immediate Action Required)

1. **IMAP/POP3 Plaintext Exposed (Ports 143, 110)**
   - **Risk:** Credentials transmitted in cleartext
   - **Impact:** Email account takeover via network sniffing
   - **Recommendation:** Disable plaintext, force TLS-only (ports 993/995)
   - **Ports affected:** 143 (IMAP), 110 (POP3)

2. **Next.js Application on Port 3000 Without SSL**
   - **Risk:** HTTP plaintext on port 3000 serves same app as HTTPS 443
   - **Impact:** Session hijacking, credential theft, MITM attacks
   - **Recommendation:** Block port 3000 externally or enforce HTTPS redirect

### High Risk Issues

3. **Multiple Unknown HTTP Services Exposed (8001-8011)**
   - **Risk:** 11 HTTP services on sequential ports, purpose unknown
   - **Impact:** Potential unauthorized access, information disclosure
   - **Recommendation:** Identify services, close unused ports, audit access controls
   - **Ports:** 8001, 8002, 8003, 8004, 8005, 8006, 8007, 8008, 8009, 8010, 8011

4. **Nostr Relay Publicly Accessible (Port 7777)**
   - **Risk:** Public relay without apparent rate limiting
   - **Impact:** Resource exhaustion, spam vector, potential abuse
   - **Recommendation:** Add authentication, rate limiting, or restrict to trusted IPs

5. **FTP Service Running (Port 21)**
   - **Risk:** ProFTPD server exposed, protocol inherently insecure
   - **Impact:** Brute force attacks, credential theft if weak passwords
   - **Recommendation:** Disable FTP, use SFTP (port 22) instead
   - **Note:** Port 22 appears closed externally (good)

6. **Admin Panel on Port 8880 (sw-cp-server)**
   - **Risk:** Appears to be Plesk control panel exposed
   - **Impact:** If compromised, full server takeover
   - **Recommendation:** Restrict to VPN/trusted IPs only, enable 2FA

### Medium Risk Issues

7. **Bitcoin P2P Port Exposed (8333)**
   - **Risk:** Necessary for node operation but increases attack surface
   - **Impact:** Potential DoS, eclipse attacks if not properly configured
   - **Mitigation:** Already exposed by design, monitor for abuse

8. **CUPS Service (Port 631)**
   - **Risk:** Printer service exposed, rarely needed externally
   - **Impact:** Potential CVE exploitation (CUPS has history of vulns)
   - **Recommendation:** Block port 631 if printing not needed externally

9. **Port 8080 Without Clear Purpose**
   - **Risk:** HTTP service with strong security headers but unknown application
   - **Impact:** Depends on application, potential attack surface
   - **Recommendation:** Audit application, ensure authentication required

10. **Port 5000 Exposed**
   - **Risk:** Unknown service, common for development servers
   - **Impact:** Potential unauthorized access if dev environment
   - **Recommendation:** Identify service, close if not production-critical

11. **Redis on Localhost Only (Good, but document)**
   - **Risk:** None currently (127.0.0.1 only)
   - **Note:** Ensure it never gets exposed externally (6379)
   - **Status:** ✅ Properly configured

12. **Multiple Chrome Processes with Listening Ports**
   - **Risk:** Chrome debugging ports (38875, 35183, 36225)
   - **Impact:** Potential remote debugging exploitation
   - **Recommendation:** Disable remote debugging in production

### Low Risk Issues

13. **X-Powered-By Header Disclosure (Next.js)**
   - **Risk:** Minor information disclosure
   - **Impact:** Attackers know tech stack
   - **Recommendation:** Remove X-Powered-By header in production

14. **Server Header Disclosure (Caddy, nginx)**
   - **Risk:** Minor information disclosure
   - **Impact:** Attackers know web server versions
   - **Recommendation:** Obscure server headers

15. **World-Writable Files in Workspace**
   - **Risk:** Low (only ebook content, non-executable)
   - **Impact:** Minimal in current context
   - **Recommendation:** Fix permissions for hygiene (`chmod 644`)

---

## Detailed Findings

### External Port Scan Results

```
Port 21:   OPEN    ProFTPD
Port 25:   OPEN    SMTP
Port 80:   OPEN    HTTP → HTTPS redirect (✅ good)
Port 110:  OPEN    POP3 plaintext (❌ critical)
Port 143:  OPEN    IMAP plaintext (❌ critical)
Port 443:  OPEN    HTTPS (Caddy + Next.js)
Port 465:  OPEN    SMTP over TLS
Port 993:  OPEN    IMAP over TLS
Port 995:  OPEN    POP3 over TLS
Port 3000: OPEN    HTTP (Next.js, no SSL) (❌ high risk)
Port 7777: OPEN    Nostr relay (❌ high risk)
Port 8001-8011: OPEN (11 services, unknown)
Port 8080: OPEN    HTTP (strong security headers)
Port 8333: OPEN    Bitcoin P2P (necessary)
Port 8443: OPEN    HTTPS (nginx, /login.php redirect)
Port 8880: OPEN    HTTP (Plesk control panel likely)
```

### Services Properly Protected (127.0.0.1)

✅ **Good configuration:**
- Redis (6379)
- PostgreSQL (5432)
- MySQL (3306)
- Bitcoin RPC (8332, 8334, 28332, 28333)
- LND (8081, 10009)
- LNURL-pay (8090)
- Ollama (11434)
- OpenClaw Gateway (18789, 18792)

### Security Headers Analysis

**Port 443 (neofreight.net):**
- ✅ Cache-Control: no-store, must-revalidate
- ⚠️ X-Powered-By: Next.js (information disclosure)
- ❌ Missing: Content-Security-Policy
- ❌ Missing: Strict-Transport-Security (HSTS)
- ❌ Missing: X-Frame-Options

**Port 8080:**
- ✅ Content-Security-Policy: frame-src 'self'; frame-ancestors 'self'; object-src 'none';
- ✅ Strict-Transport-Security: max-age=31536000; includeSubDomains
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: no-referrer

**Port 8443:**
- ✅ X-Frame-Options: SAMEORIGIN
- ✅ X-XSS-Protection: 1; mode=block
- ✅ X-Content-Type-Options: nosniff
- ❌ Missing: HSTS
- ❌ Missing: CSP

---

## Recommendations Priority Matrix

### Immediate (< 24 hours)
1. Disable IMAP/POP3 plaintext (ports 143, 110)
2. Block port 3000 externally or add HTTPS
3. Restrict port 8880 (Plesk) to VPN/trusted IPs only

### Short-term (< 1 week)
4. Audit and close unused ports (8001-8011, 5000)
5. Add rate limiting to Nostr relay (port 7777) or restrict access
6. Disable FTP (port 21), use SFTP instead
7. Add HSTS header to port 443
8. Add Content-Security-Policy to port 443

### Medium-term (< 1 month)
9. Remove X-Powered-By headers
10. Obscure Server headers
11. Disable Chrome remote debugging in production
12. Block CUPS (port 631) if not needed
13. Enable 2FA on all admin panels

### Long-term (Ongoing)
14. Implement Web Application Firewall (WAF)
15. Set up intrusion detection (fail2ban, etc.)
16. Regular vulnerability scanning (monthly)
17. Security audit of all exposed services
18. Penetration testing (quarterly)

---

## Tools Used

- Port scanning: netcat (nc) + bash scripting
- HTTP headers: curl
- Internal audit: ss (socket statistics)
- File permissions: find

## Tools NOT Available (would improve audit)

- nmap (comprehensive port scanning)
- nikto (web vulnerability scanner)
- sqlmap (SQL injection testing)
- dirb/gobuster (directory bruteforce)
- metasploit (exploitation framework)

---

## Comparison to Hardening Best Practices

From `clawdbot-ansible` hardening baseline:

| Practice | Status | Notes |
|----------|--------|-------|
| Firewall (UFW) | ❌ | No UFW, firewall at VPS level (Daniel confirmed) |
| VPN (Tailscale) | ✅ | VPN open (Daniel confirmed) |
| Default-deny policy | ⚠️ | Many ports exposed, should be more restrictive |
| Minimal exposed services | ❌ | 20+ ports exposed, excessive |
| HTTPS-only | ⚠️ | Port 3000 serves HTTP |
| Strong CSP | ⚠️ | Only on port 8080, missing on 443 |
| HSTS | ⚠️ | Only on port 8080, missing on 443 |

---

## Next Steps

**Phase 1 Complete:** External + Internal reconnaissance  
**Phase 2 (if authorized):** Active vulnerability testing
- SQL injection probes
- XSS testing
- Authentication bypass attempts
- CSRF testing
- File upload vulnerabilities
- Session hijacking tests

**Requires explicit authorization before proceeding to Phase 2.**

---

**Auditor:** Claudio AI Agent  
**Report Generated:** 2026-02-06 11:40 UTC  
**Status:** Preliminary findings, active testing not yet performed
