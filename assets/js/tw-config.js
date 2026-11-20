/* Tema do Tailwind – identidade GOTT (branco, laranja e grafite #4d4d4d) */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#4d4d4d', deep: '#3a3a3a', text: '#2e2e2e', soft: '#8a8a8a', line: '#d9d9d9' },
        orange: { DEFAULT: '#f97316', deep: '#ea580c', hover: '#ea580c' },
        paper: '#f5f4f0',
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { DEFAULT: '0', sm: '0', md: '0', lg: '0', xl: '0', '2xl': '0' },
    },
  },
};
