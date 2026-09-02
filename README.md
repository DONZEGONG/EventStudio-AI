# AI Image to Poster 🎨✨ (v0.1.0-alpha)

Turn your school events and photos into promotional posters in seconds. This web application provides a real-time, interactive poster-building canvas paired with a modern event details form. 

---

## 🚀 Key Features (Version-0)

*   **Interactive Live Preview**: Watch the poster update instantly on the canvas as you type the Event Name, Venue, and select dates.
*   **Drag & Drop Image Upload**: Seamlessly upload an event banner or background image using a drag-and-drop zone or a file dialog, with a real-time thumbnail preview and clear-image utility.
*   **Theme Presets**: Instantly style posters with custom theme templates including:
    *   *Modern & Clean*
    *   *Neon Cyberpunk*
    *   *Retro Vintage*
    *   *Playful & Artistic*
    *   *Academic & Formal*
*   **Simulated AI Poster Generation**: Click **Generate Poster** to witness a mock loading state, custom animations, and automated styling transitions.
*   **Premium Dark UI**: Built with a sleek dark-mode layout, glassmorphism card styling, responsive grid alignment, and micro-interactions.

---

## 🛠️ Technology Stack

*   **Backend**: Python, Flask (serves the template and assets directly from the root for beginner-friendly local execution).
*   **Frontend Structure**: Semantic HTML5, FontAwesome (v6.4.0) icons, and Google Fonts (*Plus Jakarta Sans* & *Outfit*).
*   **Frontend Style**: Vanilla CSS3 using custom properties (design tokens) for a fully responsive, modern layout.
*   **Frontend Logic**: Vanilla JavaScript (ES6) for DOM manipulation, file readers (Base64 encoding), and event bindings.

---

## 📂 Project Structure

```text
school-event-ai/
├── app.py              # Flask server configuration & routing
├── index.html          # Main HTML5 structure of the single-page application
├── style.css           # Design tokens, global layout styles, and theme rules
├── script.js           # Form handling, image processing, and preview rendering
└── requirements.txt    # Python package dependencies (Flask)
```

---

## ⚙️ How to Get Started

### 1. Prerequisites
Ensure you have **Python 3.8+** installed on your system.

### 2. Install Dependencies
Navigate to the project root directory in your terminal and install Flask using:
```bash
pip install -r requirements.txt
```

### 3. Run the Application
Start the Flask local development server:
```bash
python app.py
```

By default, Flask will run the app in **Debug Mode** on:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🔮 Roadmap / Future Enhancements
*   [ ] **Real AI Image Generation**: Integrate a text-to-image/image-to-image API (e.g., Imagen, Stable Diffusion) to create background art based on the theme and event name.
*   [ ] **Export/Download**: Allow users to download high-resolution posters as PNG/JPEG or print-ready PDF formats.
*   [ ] **Custom Font Styles & Sizes**: Provide controls to change font size, color, and positions of the event text overlays.
*   [ ] **Database Integration**: Save generated posters to a backend database for history and sharing.
