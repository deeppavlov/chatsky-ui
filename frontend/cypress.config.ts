import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    retries: {
      runMode: 2,
      openMode: 0,
    },
    setupNodeEvents() {
      // implement node event listeners here
    },

    baseUrl: 'http://localhost:5173/app',
  },
})
