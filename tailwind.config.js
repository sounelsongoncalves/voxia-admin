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
                    primary: '#2b8cee', // Azul Principal
                    secondary: '#34D399', // Verde Água (Action)
                    hover: '#1a7bd9', // Azul um pouco mais escuro para hover
                },
                bg: {
                    main: '#101922', // Background Dark
                    sec: '#192633', // Surface Dark
                },
                surface: {
                    1: '#1c2a38', // Surface Card
                    2: '#233040', // Lighter surface
                    3: '#2a3848', // Even lighter
                    border: '#324d67', // Border Dark
                },
                txt: {
                    primary: '#FFFFFF', // Text Primary
                    secondary: '#92adc9', // Text Secondary
                    tertiary: '#64748b',
                    disabled: '#475569',
                    inverse: '#101922',
                },
                semantic: {
                    success: '#22c55e', // Success
                    warning: '#F59E0B', // Warning
                    error: '#EF4444', // Error
                    info: '#3b82f6',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
