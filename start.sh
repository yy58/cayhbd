#!/bin/bash

# Kill any existing http server
pkill -f "python3 -m http.server 8000" 2>/dev/null

# Start fresh server
cd "$(dirname "$0")"
echo "🎂 生日网站已启动！"
echo ""
echo "在你的电脑上访问:"
echo "  http://localhost:8000"
echo ""
echo "想要让 cay 在她的手机上看到？"
echo ""
echo "方法 1: 使用 ngrok（需要有效的 authtoken）"
echo "在另一个终端运行:"
echo "  ngrok http 8000"
echo ""
echo "方法 2: 输入你的 Mac IP 地址"
echo "在终端运行以获取你的局域网 IP:"
echo "  ipconfig getifaddr en0"
echo "然后分享: http://YOUR_IP:8000"
echo ""

python3 -m http.server 8000
