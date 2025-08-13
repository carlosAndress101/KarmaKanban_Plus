import { hc } from "hono/client";
import { AppType } from "../app/api/[[...route]]/route";

// Get the base URL for the API
const getBaseUrl = () => {
  // If running on the server, use localhost
  if (typeof window === 'undefined') {
    return 'http://localhost:3000';
  }
  
  // If in browser, use the current origin
  return window.location.origin;
};

export const client = hc<AppType>(getBaseUrl());
