# 🛠️ Pixel-Toolkit (PixelKit)

> **Pixel-Toolkit** is a high-performance, local-first Desktop Toolkit tailored for Frontend Developers, Creative Technologists, and Animation Specialists — powered by **Tauri 2 + Svelte 5 + Rust**.

---

## 🎨 Visual Philosophy: Industrial Pro Dark
Inspired by professional creative suites like **Figma, Adobe Creative Cloud, and Blender**:
- High-contrast, fatigue-free dark mode (`#1a1a1a` core surface)
- Crisp 1px structural micro-borders
- No distracting glowing gimmicks — pure craftsmanship, focus, and utility
- Responsive Studio Workspaces & Interactive Category Cards

---

## 🗂️ Studio Categories & Tools

### 🎬 Video Studio
* **YouTube Downloader**:
  * Download full videos or extract audio tracks (`MP3 320kbps`, `M4A/AAC`, `WAV`, `FLAC`).
  * **Custom Save Destination**: Select or enter any system directory (`Downloads`, `Videos`, `Desktop`, or custom paths) with automatic session persistence.
  * **Time Range / Clip Trimmer**: Define precise start and end points (`00:01:15` → `00:03:45`) to download only the specific segment needed.
  * Download queue & history tracking with clip tags.
* **Video Frame Extractor**:
  * Extract ultra-high-resolution image frames at exact timestamps or intervals.
  * Preview timeline scrubber and batch export as PNG/JPEG or ZIP archive.

### 🖼️ Image Studio
* **Image Compressor & Resizer**:
  * Real-time client-side compression using HTML5 Canvas & Web Workers.
  * Format conversion (`WebP`, `JPEG`, `PNG`) with dimension scaling and aspect ratio locking.
  * Side-by-side comparison with instant file size savings calculation.

### 🎨 CSS & Styling
* **CSS Gradient Generator**:
  * Multi-stop Linear, Radial, and Conic gradient builder with interactive angle dials.
  * Curated modern presets and clean CSS code export.
* **Box Shadow Generator**:
  * Multi-layer shadow elevation system with inset/outset support and blur/spread controls.
* **Color Palette & Harmony**:
  * Harmonic color palette generation (Complementary, Analogous, Triadic, Monochromatic).
  * WCAG 2.1 AA/AAA contrast ratio calculator and CSS custom property token exporter.

### ✨ Motion & GSAP
* **GSAP Playground**:
  * Interactive GSAP 3 animation sandbox with live canvas visualizer.
  * Timeline scrubber, Play/Pause/Restart/Reverse controls, and easing curves (`Elastic`, `Bounce`, `Power`, `Back`).

### ✏️ SVG & Vectors
* **SVG Path Editor**:
  * Visual SVG path inspector and coordinate manipulation tool.
  * Real-time path command generation (`M`, `L`, `C`, `Q`, `Z`) with clean markup export.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology |
|---|---|
| **Desktop Shell** | [Tauri 2](https://tauri.app/) (Rust backend) |
| **Frontend Framework** | [Svelte 5](https://svelte.dev/) (Runes reactivity system) + [SvelteKit](https://kit.svelte.dev/) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) |
| **Icons** | [Lucide Svelte](https://lucide.dev/) |
| **Styling** | Vanilla CSS with Modular Design Tokens |
| **State Management** | Svelte 5 `$state` & `$derived` runes with reactive stores |

---

## 🌿 Git Branching Workflow

This project adheres to a structured Git flow:
- `main`: Production-ready, stable releases.
- `develop`: Primary integration branch for verified features.
- `feature/<feature-name>`: Dedicated branch for every new feature or tool.
  1. Branch off from `develop`: `git checkout -b feature/name`
  2. Implement and verify the feature.
  3. Merge back into `develop` once tested.
  4. Merge `develop` into `main` for release milestones.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Rust](https://www.rust-lang.org/) (for Tauri desktop builds)

### Installation
```bash
# Clone the repository
git clone https://github.com/mohamedmagdy-dev/Pixel-Toolkit.git
cd Pixel-Toolkit

# Install dependencies
npm install
```

### Development
```bash
# Run web preview server
npm run dev

# Run desktop application via Tauri
npm run tauri dev
```

### Production Build
```bash
# Build frontend web bundle
npm run build

# Build native desktop installer (.exe / .msi)
npm run tauri build
```

---

## 📄 License
Open source under the [MIT License](LICENSE).
