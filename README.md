# Bible Descendants Mindmap

## Project Overview
This project visualizes the full genealogy of the Bible (from Adam to the end) as an animated, interactive, and mobile-friendly mindmap. The goal is to provide an unlimited, branching, and searchable family tree accessible on all devices, especially optimized for iOS.

---

## Features
- **Animated, interactive mindmap** of all biblical descendants
- **Unlimited branching** covering all major and minor genealogies
- **Mobile-first, iOS-friendly design**
- **Zoom, pan, and tap/click to view node details**
- **Modern, clean UI**
- **Expandable data structure** for future additions

---

## Progress Log
- [x] Project initialized
- [x] Dependencies installed (React, react-flow-renderer, Tailwind CSS)
- [x] Basic mindmap component created
- [x] Sample data structure added
- [x] Full genealogy data entry completed (Adam → Noah → Shem, Ham, Japheth → Abraham → Isaac & Ishmael → Jacob/Israel → 12 tribes → King David/Solomon → Jesus, plus all major lines)
- [x] Animated, interactive mindmap implemented
- [x] Mobile/iOS polish
- [ ] Final review and polish

---

## Getting Started

### Prerequisites
- Node.js (v16 or later recommended)
- npm

### Installation & Running Locally
1. Clone or download this repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser to [http://localhost:5173](http://localhost:5173)

### Project Structure
- `src/components/Mindmap.jsx` – Main mindmap visualization
- `src/data/descendants.json` – Full genealogy data
- `src/App.jsx` – App shell
- `src/index.css` – Tailwind CSS and global styles

---

## Data Expansion & Editing
- To add or edit genealogies, update `src/data/descendants.json`.
- The data format is a nested tree (`name`, `children`).
- For very large expansions, consider splitting into multiple files and loading dynamically.

---

## Roadmap
- [ ] Add search and filter for quick navigation
- [ ] Node details modal (show verse references, extra info)
- [ ] Export/share mindmap views
- [ ] Performance optimizations for very large trees

---

## Credits & Sources
- Biblical genealogies: Genesis, 1 Chronicles, Matthew 1, Luke 3, and other references
- Visualization: [react-flow-renderer](https://reactflow.dev/)

---

## License
MIT License
