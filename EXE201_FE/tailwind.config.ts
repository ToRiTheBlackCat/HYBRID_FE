import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme : {
    extend:{
        fontFamily:{
            quicksand: "Quicksand, sans-serif",
        },
    },
},
plugins: [],
}
export default config