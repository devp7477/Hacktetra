#!/bin/bash

# Start the server
echo "Starting the server..."
cd "$(dirname "$0")/server" && npm run dev &
SERVER_PID=$!

# Start the client
echo "Starting the client..."
cd "$(dirname "$0")/client" && npm run dev &
CLIENT_PID=$!

# Function to handle script termination
cleanup() {
  echo "Stopping services..."
  kill $SERVER_PID $CLIENT_PID 2>/dev/null
  exit 0
}

# Register the cleanup function for script termination
trap cleanup INT TERM

echo "Services started. Press Ctrl+C to stop all services."
echo "Server running at http://localhost:5001"
echo "Client running at http://localhost:3002"

# Keep the script running
wait
