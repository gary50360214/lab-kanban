import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({

  plugins: [
    vue()
  ],

  server: {
    host: "0.0.0.0",
    allowedHosts: [
      "lab_frontend",
      "192.168.127.249",
 "ctl.gigacomputing.net"
    ]
  }

})
