# 💧 HydroFlow — AI-Powered Smart Hydration

![HydroFlow Header](https://raw.githubusercontent.com/lucide-react/lucide/main/icons/droplet.svg)

[![React](https://img.shields.io/badge/React-18.2-blue.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini_3-orange.svg?logo=google-gemini)](https://ai.google.dev/)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green.svg?logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple.svg?logo=pwa)](https://web.dev/progressive-web-apps/)

**HydroFlow** is a premium, mobile-first wellness application that transforms the daily necessity of hydration into an immersive, gamified experience. It leverages **Google Gemini 3 AI** for personalized coaching and **Supabase** for secure, cross-device data persistence.

---

## 🌟 High-Level Features

### 🌊 Engineering Meet Aesthetics
*   **Dynamic Wave Engine:** A custom-built SVG fluid dynamics simulator. Using multi-layered parallax paths and CSS keyframes, it creates a tactile "liquid" feedback as you log intake.
*   **AMOLED Design Language:** Built with a "Fluid Glass" aesthetic. Features deep black themes for battery optimization and backdrop-blur overlays for a modern spatial feel.
*   **Haptic & Audio UI:** High-fidelity web-audio triggers for pouring, success, and navigation, providing a native-app sensory experience.

### 🤖 Generative AI Integration
*   **Context-Aware Advice:** Integrated with **Gemini-3-Flash** to provide real-time hydration tips based on your current progress, local weather, and time of day.
*   **Deep-Dive Analytics:** Generates weekly motivation reports that identify behavioral patterns (e.g., "Weekend Slumps") and suggest actionable improvements.

### ⚙️ Precision Utility
*   **Smart Goal Engine:** A physiological calculator that determines intake targets based on body weight, activity level, and gender.
*   **Resilient Notification System:** A dual-mode engine (Interval vs. Scheduled) that uses Service Workers to ensure reminders are delivered even when the app is backgrounded.
*   **Cloud-Native Architecture:** Seamlessly syncs between a privacy-first "Guest Mode" (LocalStorage) and "Cloud Mode" (Supabase Auth/DB).

---

## 🛠️ Technical Stack & Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend Core** | React 18 (Hooks, Context API), TypeScript |
| **Styling** | Tailwind CSS, Framer Motion (Transitions) |
| **AI Processing** | @google/genai (Gemini 3 Pro/Flash) |
| **Database/Auth** | Supabase (PostgreSQL, Row Level Security) |
| **Visualization** | Recharts (Customized D3.js implementation) |
| **PWA Features** | Service Workers, Manifest API, Web Notifications |
| **Audio Engine** | Web Audio API (OscillatorNode, GainNode) |

---

## 🧠 Technical Challenges & Engineering Solutions

### 1. The "Mobile Viewport" Problem
**Challenge:** Standard CSS `100vh` often causes layout breaking on mobile browsers due to dynamic address bars and virtual keyboards.
**Solution:** Implemented `h-[100dvh]` (Dynamic Viewport Height) combined with `env(safe-area-inset-bottom)` to ensure the bottom navigation remains perfectly accessible on iPhone/Android without overlapping OS-level gesture bars.

### 2. Fluid SVG Performance
**Challenge:** Animating complex SVG paths can be CPU-intensive on older mobile devices.
**Solution:** Optimized the Wave Gauge by separating the wave logic into three distinct components with varying animation speeds. By using CSS `transform: translateX` instead of modifying SVG path data in JS, I offloaded the rendering to the GPU, maintaining a stable 60FPS.

### 3. AI Prompt Engineering
**Challenge:** Ensuring the LLM provides concise, actionable, and non-hallucinatory advice in a "wellness" context.
**Solution:** Developed a strict system instruction set for the Gemini API that enforces specific output lengths, plain-text formatting (no markdown artifacts), and scientific accuracy regarding hydration heuristics.

---

## 🚀 Development Setup

### 1. Clone & Dependencies
```bash
git clone https://github.com/yourusername/hydroflow.git
cd hydroflow
npm install
```

### 2. Environment Configuration
Update your credentials in the following files:
- **Gemini API:** Set your key in `index.html` (via process.env) or the execution environment.
- **Supabase:** Update `services/supabaseClient.ts` with your `SUPABASE_URL` and `SUPABASE_KEY`.

### 3. Deployment
The app is optimized for **Vercel** or **Netlify**. Ensure "Service Worker" support is enabled in your production build settings.

---

## 📈 Future Roadmap
- [ ] **Wearable Integration:** Apple Health / Google Fit sync via Web Bluetooth API.
- [ ] **Social Circles:** Anonymous "Hydration Squads" for community challenges.
- [ ] **Advanced AI Sensing:** Image recognition for different drink types using Gemini Vision.

---

## 👨‍💻 Author —
Made And Love With Pratik 

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
