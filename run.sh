#!/bin/bash

# Function to display help
show_help() {
  echo "Usage: ./run.sh [option]"
  echo "Options:"
  echo "  frontend   Start the frontend server on port 3001"
  echo "  backend    Start the backend server on port 5001"
  echo "  both       Start both frontend and backend servers"
  echo "  install    Install dependencies for both frontend and backend"
  echo "  help       Show this help message"
}

# Function to install dependencies
install_deps() {
  echo "Installing backend dependencies..."
  cd server
  npm install
  
  echo "Installing shared dependencies..."
  cd ../shared
  npm install
  
  echo "Installing frontend dependencies..."
  cd ../client
  npm install
}

# Function to run backend
run_backend() {
  echo "Starting backend server on port 5001..."
  cd server
  npm run dev
}

# Function to run frontend
run_frontend() {
  echo "Starting frontend server on port 3001..."
  cd client
  npm run dev
}

# Function to run both
run_both() {
  echo "Starting both frontend and backend servers..."
  # Start backend in background
  cd server
  npm run dev > backend.log 2>&1 &
  BACKEND_PID=$!
  echo "Backend server started with PID: $BACKEND_PID"
  
  # Start frontend
  cd ../client
  npm run dev
  
  # When frontend exits, kill backend
  kill $BACKEND_PID
}

# Main script logic
case "$1" in
  frontend)
    run_frontend
    ;;
  backend)
    run_backend
    ;;
  both)
    run_both
    ;;
  install)
    install_deps
    ;;
  help|*)
    show_help
    ;;
esac