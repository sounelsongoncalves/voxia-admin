/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./App.tsx"
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#00CC99', // Acento (Green/Teal) - Cor principal
                    secondary: '#007AFF', // Info Blue
                    hover: '#00A37A', // Darker Green for hover
                },
                bg: {
                    main: '#0B0D10', // Background Dark
                    sec: '#111418', // Surface Dark
                },
                surface: {
                    1: '#161A1F', // Surface Card
                    2: '#2A2E35', // Lighter surface
                    3: '#323842', // Even lighter
                    border: '#2A2E35', // Border Dark
                },
                txt: {
                    primary: '#FFFFFF', // Text Primary
                    secondary: '#E0E0E0', // Text Secondary
                    tertiary: '#A0A0A0',
                    disabled: '#64748B',
                    inverse: '#0B0D10',
                },
                semantic: {
                    success: '#00CC99', // Success (Same as brand)
                    warning: '#FFC107', // Warning
                    error: '#FF3B30', // Error
                    info: '#007AFF', // Info
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
