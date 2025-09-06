import React from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from '@clerk/clerk-react';
import App from "./App";
import "./index.css";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_bWFqb3ItY2F0LTczLmNsZXJrLmFjY291bnRzLmRldiQ';

// In development mode, we can continue without a key
if (!PUBLISHABLE_KEY && process.env.NODE_ENV !== 'development') {
  console.error('Missing Clerk Publishable Key');
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <App />
  </ClerkProvider>
);
