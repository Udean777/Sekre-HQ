#!/bin/bash
# Quick commands for Sekre development

# Load env if exists
if [ -f sekre-backend/.env ]; then
    source sekre-backend/.env
fi

# Defaults
SERVER_PORT=${SERVER_PORT:-8080}
API_URL="http://localhost:${SERVER_PORT}"

case "$1" in
  "start")
    echo "Starting backend with live reload..."
    cd sekre-backend
    nohup make dev > /tmp/backend.log 2>&1 &
    echo $! > /tmp/backend.pid
    sleep 3
    echo "Backend started! PID: $(cat /tmp/backend.pid)"
    echo "Health check:"
    curl -s ${API_URL}/health | jq .
    ;;
    
  "stop")
    echo "Stopping backend..."
    if [ -f /tmp/backend.pid ]; then
      kill $(cat /tmp/backend.pid) 2>/dev/null
      rm /tmp/backend.pid
    fi
    pkill -f "air" 2>/dev/null
    echo "Backend stopped"
    ;;
    
  "restart")
    $0 stop
    sleep 2
    $0 start
    ;;
    
  "logs")
    tail -f /tmp/backend.log
    ;;
    
  "status")
    echo "=== Backend Status ==="
    if curl -s ${API_URL}/health > /dev/null 2>&1; then
      echo "✅ Backend is running"
      curl -s ${API_URL}/health | jq .
    else
      echo "❌ Backend is not running"
    fi
    echo ""
    echo "=== Processes ==="
    ps aux | grep -E "air|go run" | grep -v grep || echo "No backend processes"
    ;;
    
  "test")
    echo "=== Testing Backend ==="
    echo "1. Health check:"
    curl -s ${API_URL}/health | jq .
    echo ""
    echo "2. CORS preflight:"
    curl -s -X OPTIONS ${API_URL}/api/v1/auth/login \
      -H "Origin: http://localhost:5173" -I 2>&1 | grep -E "HTTP|Access-Control"
    echo ""
    echo "3. Login test:"
    curl -s -X POST ${API_URL}/api/v1/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"test@example.com","password":"password123"}' | jq '.success, .message'
    ;;
    
  "clean")
    echo "Cleaning up..."
    $0 stop
    cd sekre-backend
    make clean
    rm -f /tmp/backend.log /tmp/backend.pid
    echo "Cleanup complete"
    ;;
    
  *)
    echo "Sekre Development Commands"
    echo ""
    echo "Usage: ./scripts/dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start backend with live reload"
    echo "  stop      - Stop backend"
    echo "  restart   - Restart backend"
    echo "  logs      - View backend logs"
    echo "  status    - Check backend status"
    echo "  test      - Test backend endpoints"
    echo "  clean     - Clean up all artifacts"
    echo ""
    echo "Examples:"
    echo "  ./scripts/dev.sh start"
    echo "  ./scripts/dev.sh logs"
    echo "  ./scripts/dev.sh test"
    ;;
esac
