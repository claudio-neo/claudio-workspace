# Security Audit — neofreight.net + Internal Server
**Started:** 2026-02-06 11:29 UTC
**Authorized by:** Daniel (@DeltaGap)
**Scope:** Full aggressive audit (Option A)
**Target:** neofreight.net + internal server infrastructure

---

## Phase 1: Reconnaissance

### DNS Enumeration

212.132.124.4
10 mx00.ionos.es.
ns1018.ui-dns.org.
ns1017.ui-dns.com. hostmaster.1und1.com. 2017060112 28800 7200 604800 600
ns1097.ui-dns.biz.
10 mx01.ionos.es.
ns1081.ui-dns.de.
ns1017.ui-dns.com.
"v=spf1 include:_spf-eu.ionos.com ~all"

### WHOIS Data


### Port Scan (nmap)
Target: neofreight.net (212.132.124.4)

/bin/bash: line 4: nmap: command not found
Scanning common ports on 212.132.124.4...
Port 21: OPEN
Port 22: closed
Port 25: OPEN
Port 80: OPEN
Port 110: OPEN
Port 143: OPEN
Port 443: OPEN
Port 465: OPEN
Port 993: OPEN
Port 995: OPEN
Port 3000: OPEN
Port 3306: closed
Port 5432: closed
Port 8000: closed
Port 8080: OPEN
Port 8443: OPEN
Port 8880: OPEN
Port 9090: closed

### HTTP Headers Analysis


#### Port 80:
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
curl: (35) OpenSSL/3.0.13: error:0A00010B:SSL routines::wrong version number

#### Port 443:
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
HTTP/2 200 
alt-svc: h3=":443"; ma=2592000
cache-control: no-store, must-revalidate
content-type: text/html; charset=utf-8
date: Fri, 06 Feb 2026 11:30:30 GMT
link: <https://neofreight.net/>; rel="alternate"; hreflang="es", <https://neofreight.net/en>; rel="alternate"; hreflang="en", <https://neofreight.net/de>; rel="alternate"; hreflang="de", <https://neofreight.net/>; rel="alternate"; hreflang="x-default"
link: </_next/static/chunks/_aea8c950._.css>; rel=preload; as="style"
server: Caddy
set-cookie: NEXT_LOCALE=es; Path=/; SameSite=lax
vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding
x-middleware-rewrite: /es
x-nextjs-cache: HIT
x-nextjs-prerender: 1
x-powered-by: Next.js


#### Port 3000:
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
curl: (35) OpenSSL/3.0.13: error:0A00010B:SSL routines::wrong version number

#### Port 8080:
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
curl: (35) OpenSSL/3.0.13: error:0A00010B:SSL routines::wrong version number

#### Port 8443:
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
HTTP/2 303 
server: nginx
date: Fri, 06 Feb 2026 11:30:30 GMT
content-type: text/html; charset=UTF-8
location: https://neofreight.net:8443/login.php
expires: Fri, 28 May 1999 00:00:00 GMT
last-modified: Fri, 06 Feb 2026 11:30:30 GMT
cache-control: no-store, no-cache, must-revalidate
pragma: no-cache
p3p: CP="NON COR CURa ADMa OUR NOR UNI COM NAV STA"
x-frame-options: SAMEORIGIN
x-xss-protection: 1; mode=block
x-content-type-options: nosniff


#### Port 8880:
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
curl: (35) OpenSSL/3.0.13: error:0A00010B:SSL routines::wrong version number

### HTTP Services (plaintext)


#### Port 80:
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
HTTP/1.1 308 Permanent Redirect
Connection: close
Location: https://neofreight.net/
Server: Caddy
Date: Fri, 06 Feb 2026 11:30:38 GMT


#### Port 3000:
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
HTTP/1.1 200 OK
link: <http://neofreight.net:3000/>; rel="alternate"; hreflang="es", <http://neofreight.net:3000/en>; rel="alternate"; hreflang="en", <http://neofreight.net:3000/de>; rel="alternate"; hreflang="de", <http://neofreight.net:3000/>; rel="alternate"; hreflang="x-default"
link: </_next/static/chunks/_aea8c950._.css>; rel=preload; as="style"
set-cookie: NEXT_LOCALE=es; Path=/; SameSite=lax
x-middleware-rewrite: /es
Vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding
Cache-Control: no-store, must-revalidate
x-nextjs-cache: HIT
x-nextjs-prerender: 1
X-Powered-By: Next.js
Content-Type: text/html; charset=utf-8
Date: Fri, 06 Feb 2026 11:30:38 GMT

#### Port 8080:
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
HTTP/1.1 200 OK
Cache-Control: no-cache, must-revalidate, no-transform, no-store
Content-Security-Policy: frame-src 'self'; frame-ancestors 'self'; object-src 'none';
Content-Type: text/html;charset=utf-8
Referrer-Policy: no-referrer
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-Robots-Tag: none
X-XSS-Protection: 1; mode=block


#### Port 8880:
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:--     0
HTTP/1.1 303 See Other
Server: sw-cp-server
Date: Fri, 06 Feb 2026 11:30:38 GMT
Content-Type: text/html; charset=UTF-8
Connection: keep-alive
Expires: Fri, 28 May 1999 00:00:00 GMT
Last-Modified: Fri, 06 Feb 2026 11:30:38 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
P3P: CP="NON COR CURa ADMa OUR NOR UNI COM NAV STA"
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block

### FTP Service (Port 21)

220 ProFTPD Server (ProFTPD) [212.132.124.4]
220 ProFTPD Server (ProFTPD) [212.132.124.4]

## Phase 2: Internal Server Audit

### Exposed Services

tcp   LISTEN 0      4096            127.0.0.1:6379       0.0.0.0:*                                                 
tcp   LISTEN 0      4096            127.0.0.1:8081       0.0.0.0:*    users:(("lnd",pid=902063,fd=35))             
tcp   LISTEN 0      511             127.0.0.1:8090       0.0.0.0:*    users:(("node",pid=2168548,fd=21))           
tcp   LISTEN 0      2048              0.0.0.0:5000       0.0.0.0:*                                                 
tcp   LISTEN 0      100               0.0.0.0:4190       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:4477       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:7777       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8080       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8007       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8006       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8005       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8004       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8003       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8002       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8001       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8011       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8010       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8009       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8008       0.0.0.0:*                                                 
tcp   LISTEN 0      4096            127.0.0.1:12768      0.0.0.0:*                                                 
tcp   LISTEN 0      4096           127.0.0.54:53         0.0.0.0:*                                                 
tcp   LISTEN 0      100             127.0.0.1:12346      0.0.0.0:*                                                 
tcp   LISTEN 0      10              127.0.0.1:38875      0.0.0.0:*    users:(("chrome",pid=3380513,fd=82))         
tcp   LISTEN 0      4096            127.0.0.1:5432       0.0.0.0:*                                                 
tcp   LISTEN 0      4096        127.0.0.53%lo:53         0.0.0.0:*                                                 
tcp   LISTEN 0      4096            127.0.0.1:3001       0.0.0.0:*                                                 
tcp   LISTEN 0      511             127.0.0.1:18789      0.0.0.0:*    users:(("openclaw-gatewa",pid=2745983,fd=22))
tcp   LISTEN 0      511             127.0.0.1:18792      0.0.0.0:*    users:(("openclaw-gatewa",pid=2745983,fd=30))
tcp   LISTEN 0      10              127.0.0.1:35183      0.0.0.0:*    users:(("chrome",pid=3033233,fd=83))         
tcp   LISTEN 0      511               0.0.0.0:8880       0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:631        0.0.0.0:*                                                 
tcp   LISTEN 0      1024              0.0.0.0:995        0.0.0.0:*                                                 
tcp   LISTEN 0      1024              0.0.0.0:993        0.0.0.0:*                                                 
tcp   LISTEN 0      100             127.0.0.1:28332      0.0.0.0:*    users:(("bitcoind",pid=59267,fd=19))         
tcp   LISTEN 0      100             127.0.0.1:28333      0.0.0.0:*    users:(("bitcoind",pid=59267,fd=21))         
tcp   LISTEN 0      1024              0.0.0.0:143        0.0.0.0:*                                                 
tcp   LISTEN 0      4096              0.0.0.0:8333       0.0.0.0:*    users:(("bitcoind",pid=59267,fd=36))         
tcp   LISTEN 0      511               0.0.0.0:8443       0.0.0.0:*                                                 
tcp   LISTEN 0      10              127.0.0.1:36225      0.0.0.0:*    users:(("chrome",pid=3137255,fd=80))         
tcp   LISTEN 0      100               0.0.0.0:25         0.0.0.0:*                                                 
tcp   LISTEN 0      1024              0.0.0.0:110        0.0.0.0:*                                                 
tcp   LISTEN 0      100               0.0.0.0:465        0.0.0.0:*                                                 
tcp   LISTEN 0      4096            127.0.0.1:11434      0.0.0.0:*                                                 
tcp   LISTEN 0      80              127.0.0.1:3306       0.0.0.0:*                                                 
tcp   LISTEN 0      4096            127.0.0.1:783        0.0.0.0:*                                                 
tcp   LISTEN 0      4096            127.0.0.1:9090       0.0.0.0:*                                                 
tcp   LISTEN 0      4096            127.0.0.1:8334       0.0.0.0:*    users:(("bitcoind",pid=59267,fd=33))         
tcp   LISTEN 0      128             127.0.0.1:8332       0.0.0.0:*    users:(("bitcoind",pid=59267,fd=12))         
tcp   LISTEN 0      4096            127.0.0.1:10009      0.0.0.0:*    users:(("lnd",pid=902063,fd=7))              
tcp   LISTEN 0      4096            127.0.0.1:2019       0.0.0.0:*                                                 
tcp   LISTEN 0      100                  [::]:4190          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:4477          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:7777          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:8080          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:8007          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:8006          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:8005          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:8004          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:8003          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:8002          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:8001          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:8011          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:8010          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:8009          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:8008          [::]:*                                                 
tcp   LISTEN 0      4096                    *:9735             *:*    users:(("lnd",pid=902063,fd=50))             
tcp   LISTEN 0      511                  [::]:8880          [::]:*                                                 
tcp   LISTEN 0      4096                 [::]:631           [::]:*                                                 
tcp   LISTEN 0      1024                 [::]:995           [::]:*                                                 
tcp   LISTEN 0      1024                 [::]:993           [::]:*                                                 
tcp   LISTEN 0      511                 [::1]:18789         [::]:*    us
### World-Writable Files (security risk)

/home/neo/.openclaw/workspace/books/mises-extracted/META-INF/container.xml
/home/neo/.openclaw/workspace/books/mises-extracted/mimetype
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/17-lnk67.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/49-lnk313.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/25-lnk109.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/71-indexR.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/29-lnk179.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/68-indexO.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/58-indexE.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/21-lnk93.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/styles.css
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/15-lnk59.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/44-lnk283.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/31-lnk198.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/53-lnk330.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/37-lnk248.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/45-lnk292.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/11-lnk34.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/24-lnk108.html
/home/neo/.openclaw/workspace/books/mises-extracted/OEBPS/63-indexJ.html

## Phase 3: Web Application Testing

### Directory Enumeration


#### https://neofreight.net

#### http://neofreight.net:3000

#### http://neofreight.net:8080
/admin: 
/.git: 
/.env: 
/api: 
/backup: 
/admin: 
/.git: 
/.env: 
/api: 
/backup: 
