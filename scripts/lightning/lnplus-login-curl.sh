#!/bin/bash
# Login to Lightning Network+ using curl + LND signature

set -e

echo "🚀 Logging in to Lightning Network+..."

# Fetch the login page and extract the message
echo "📄 Fetching login page..."
MESSAGE=$(curl -s 'https://lightningnetwork.plus/ln_sign_in' | grep -oP 'lnplus-login-[a-f0-9]+-[a-f0-9]+-[a-f0-9]+' | head -1)

if [ -z "$MESSAGE" ]; then
  echo "❌ Could not extract login message"
  exit 1
fi

echo "📝 Message to sign: $MESSAGE"

# Sign with LND
echo "🔐 Signing with LND..."
SIGNATURE=$(/home/neo/lnd-linux-amd64-v0.20.0-beta/lncli --lnddir=/home/neo/.lnd --network=mainnet signmessage "$MESSAGE" | jq -r '.signature')

if [ -z "$SIGNATURE" ]; then
  echo "❌ Failed to sign message"
  exit 1
fi

echo "✅ Signature generated: ${SIGNATURE:0:50}..."

# Submit the signature
echo "📤 Submitting signature..."
RESPONSE=$(curl -s -c /tmp/lnplus_cookies.txt -X POST 'https://lightningnetwork.plus/ln_sign_in' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "signature=$SIGNATURE" \
  --data-urlencode "message=$MESSAGE")

# Check if logged in (look for redirect or success)
if echo "$RESPONSE" | grep -q "Redirecting\|successfully\|dashboard"; then
  echo "✅ Login successful!"
else
  echo "❓ Response received (checking cookies)..."
  if [ -s /tmp/lnplus_cookies.txt ]; then
    echo "🍪 Cookies saved"
  else
    echo "⚠️ No cookies - login may have failed"
  fi
fi

# Try to access profile to verify
echo "🔍 Verifying login..."
PROFILE=$(curl -s -b /tmp/lnplus_cookies.txt 'https://lightningnetwork.plus/nodes/02c8e87a7ab29092eba909533919c508839aea48d8e6a88c39c42a0f198a5f6401')

if echo "$PROFILE" | grep -q "ClaudioNode\|Sign Out\|logout"; then
  echo "✅ Successfully logged in as ClaudioNode!"
else
  echo "❌ Login verification failed"
  echo "Response preview:" 
  echo "$PROFILE" | head -20
fi

echo "Done."
