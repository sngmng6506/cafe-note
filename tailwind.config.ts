import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#2563eb",
          soft: "#dbeafe",
          dark: "#1d4ed8"
        }
      }
    }
  },
  plugins: [forms]
};

export default config;
