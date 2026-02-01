# LND Launch Checklist
*Execute when IBD completes (check-ibd-complete.sh returns 0)*

## Pre-Launch

### 1. Reduce bitcoind dbcache (free RAM for LND)
```bash
# Edit bitcoin.conf
sed -i 's/dbcache=2048/dbcache=512/' ~/.bitcoin/bitcoin.conf

# Restart bitcoind
/home/neo/bitcoin-29.2/bin/bitcoin-cli stop
sleep 10
/home/neo/bitcoin-29.2/bin/bitcoind -daemon
sleep 5
/home/neo/bitcoin-29.2/bin/bitcoin-cli getblockchaininfo | grep initialblockdownload
# Should be: false
```

### 2. Verify ZMQ is working
```bash
/home/neo/bitcoin-29.2/bin/bitcoin-cli getzmqnotifications
# Should show pubrawblock and pubrawtx
```

### 3. Check available RAM
```bash
free -h | grep Mem
# Need at least 2GB available after bitcoind restart
```

## Launch LND

### 4. Start LND
```bash
/home/neo/lnd-linux-amd64-v0.20.0-beta/lnd &
# Wait for it to start...
sleep 10
```

### 5. Create wallet (⚠️ SAVE SEED OFFLINE!)
```bash
/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli create
# Choose: new wallet
# Set wallet password (save in .env)
# Write down 24-word seed → GIVE TO DANIEL, never store digitally
```

### 6. Verify LND is running
```bash
/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli getinfo
# Check: synced_to_chain = true, synced_to_graph = true (may take time)
```

## Post-Launch

### 7. Create systemd services
```bash
# bitcoind service
sudo tee /etc/systemd/system/bitcoind.service << 'EOF'
[Unit]
Description=Bitcoin daemon
After=network.target

[Service]
Type=forking
User=neo
ExecStart=/home/neo/bitcoin-29.2/bin/bitcoind -daemon
ExecStop=/home/neo/bitcoin-29.2/bin/bitcoin-cli stop
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

# lnd service
sudo tee /etc/systemd/system/lnd.service << 'EOF'
[Unit]
Description=Lightning Network Daemon
After=bitcoind.service
Requires=bitcoind.service

[Service]
Type=simple
User=neo
ExecStart=/home/neo/lnd-linux-amd64-v0.20.0-beta/lnd
Restart=on-failure
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable bitcoind lnd
```

### 8. Configure automatic channel backup
```bash
# LND auto-creates channel.backup in ~/.lnd/data/chain/bitcoin/mainnet/
# Set up periodic copy to workspace (git backed)
```

## Decisions for Daniel
- [ ] Routing node or personal only? (affects pruning decision)
- [ ] Tor? (privacy vs latency)
- [ ] How much BTC to fund channels? (minimum ~50k sats per channel)
- [ ] Which nodes to connect to first?
- [ ] Wallet password (will need to unlock on restart)
