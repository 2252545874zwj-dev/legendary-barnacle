import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
<<<<<<< HEAD
    host: '0.0.0.0',
=======
<<<<<<< HEAD
    host: '0.0.0.0',
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true
<<<<<<< HEAD
=======
=======
>>>>>>> ac58535bee06e561eeda876df089ccdadedcee65
>>>>>>> a648754d40cbc3e44cd03f0cf82527487e5b6465
      }
    }
  }
})