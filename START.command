#!/bin/bash
cd "$(dirname "$0")"
echo "启动生日网站服务器..."
python3 -m http.server 8000 &
sleep 2
open http://localhost:8000
echo ""
echo "✓ 服务器已启动在 http://localhost:8000"
echo ""
echo "想要让 cay 在她的手机上看到这个网站？"
echo ""
echo "选项 1: 免费远程链接（推荐）"
echo "访问 https://dashboard.ngrok.com/signup 注册免费账户"
echo "然后在终端运行："
echo "  ngrok config add-authtoken YOUR_TOKEN"
echo "  ngrok http 8000"
echo ""
echo "选项 2: 同一WiFi网络"
echo "在Mac终端运行:"
echo "  ifconfig | grep 'inet ' | grep -v 127"
echo "找到类似 192.168.x.x 的地址，分享给 cay："
echo "  http://你的IP:8000"
echo ""
wait
