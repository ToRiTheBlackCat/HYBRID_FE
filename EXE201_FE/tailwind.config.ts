import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme : {
    extend:{
        fontFamily:{
            quicksand: "Quicksand, sans-serif",
        },
        transformStyle: {
        'preserve-3d': 'preserve-3d',
        },
        backfaceVisibility: {
            hidden: 'hidden',
        },
        perspective: {
        '500': '500px',
        },
    },
},
plugins: [],
}
export default config