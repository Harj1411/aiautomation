/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#090D16',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155'
        },
        brand: {
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA'
        },
        agent: {
          planner: '#8B5CF6',
          execution: '#3B82F6',
          validation: '#10B981',
          recovery: '#F59E0B',
          monitoring: '#EC4899'
        }
      }
    }
  },
  plugins: []
};
