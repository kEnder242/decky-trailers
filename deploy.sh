#!/bin/bash
set -e

# Load config
if [ -f "deck.config" ]; then
    source deck.config
else
    echo "❌ Error: deck.config not found."
    echo "Please create a deck.config file with DECK_IP=your_deck_ip"
    exit 1
fi

PLUGIN_NAME="DeckyTrailers"
DECK_HOST="deck@$DECK_IP"
DECK_PLUGIN_DIR="/home/deck/homebrew/plugins/$PLUGIN_NAME"

echo "🚧 Building $PLUGIN_NAME..."
pnpm run build

echo "📦 Packaging..."
rm -rf deploy
mkdir -p deploy/$PLUGIN_NAME/dist
cp -r dist/* deploy/$PLUGIN_NAME/dist/
cp plugin.json main.py package.json deploy/$PLUGIN_NAME/
cp README.md LICENSE deploy/$PLUGIN_NAME/ || true

echo "🚀 Deploying to $DECK_HOST..."
scp -r deploy/$PLUGIN_NAME $DECK_HOST:/home/deck/tmp/

echo "🔄 Installing and Restarting..."
ssh $DECK_HOST "sudo rm -rf $DECK_PLUGIN_DIR && sudo mv /home/deck/tmp/$PLUGIN_NAME /home/deck/homebrew/plugins/ && sudo systemctl restart plugin_loader.service"

echo "✅ Done! Check the Deck."