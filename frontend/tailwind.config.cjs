module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'deepest-bg': '#0B0D0F',
        'base-bg': '#111317',
        'surface': '#191C20',
        'elevated': '#212529',
        'primary-text': '#ECEDEE',
        'secondary-text': '#B7BBC1',
        'muted-text': '#6A6F76',
        'accent': '#20C997',
        'accent-hover': '#18a779',
        'danger': '#D9534F',
        'border-subtle': '#2A2E33'
      },
      fontFamily: {
        inter: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      borderRadius: {
        smd: '6px'
      }
    }
  },
  plugins: []
}
