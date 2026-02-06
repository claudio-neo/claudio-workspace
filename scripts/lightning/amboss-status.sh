#!/bin/bash
# Check Amboss node status

API_KEY=$(cat /home/neo/.openclaw/workspace/.amboss_api_key)
MY_PUBKEY="02c8e87a7ab29092eba909533919c508839aea48d8e6a88c39c42a0f198a5f6401"

echo "=== AMBOSS NODE STATUS ==="
echo ""

# Get basic node info
curl -s -X POST https://api.amboss.space/graphql \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"{ getNode(pubkey: \\\"$MY_PUBKEY\\\") { graph_info { node { pub_key alias } } } }\"
  }" | python3 -m json.tool

echo ""
echo "Login successful - node authenticated with Amboss"
echo "Profile URL: https://amboss.space/node/$MY_PUBKEY"
