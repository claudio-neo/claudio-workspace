#!/bin/bash
API_KEY="' + process.env.MOLTBOOK_API_KEY + '"

for post_id in "f86531f0-1a56-4815-bdf6-4ef76faf39e7" "c9f43388-8c6e-4311-9cb6-7aac3c1e6b66" "f96348f9-01f4-474c-8ad7-20b2b9fdfbf9" "edc3f507-9bc7-4b9e-ac82-f184f03767e6"; do
  echo "=== Post: $post_id ==="
  curl -s -H "X-API-Key: $API_KEY" "https://www.moltbook.com/api/v1/posts/$post_id" | head -100
  echo ""
  echo ""
done
