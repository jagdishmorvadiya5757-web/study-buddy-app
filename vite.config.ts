export default defineConfig(({ mode }) => ({
  // The dot '.' before the slash is the most important part!
  base: './', 
  build: {
    outDir: 'dist',
  },
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));