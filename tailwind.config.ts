import type { Config } from "tailwindcss";
const flowbite = require("flowbite-react/tailwind");

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
        flowbite.content(),
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                bgSecondary: "var(--background-secondary)",
                primary: "var(--primary)",
                secondary: "var(--secondary)",
                success: "var(--success)",
                danger: "var(--danger)",
                warning: "var(--warning)",
            },
            fontFamily: {
                roboto: ["Roboto", "sans-serif"],
            },
        },
    },
    plugins: [flowbite.plugin()],
} satisfies Config;
