<div align="center">

# 🌀 Truchet Weave Background

### An interactive, endlessly evolving geometric Canvas background for Framer

**Made with 💛 by Karim Saif**

[**Live Preview**](https://truchetweavebackground.framer.website/) · [**Explore the Component**](https://truchetweavebackground.framer.website/) · [**Contact the Creator**](mailto:karimsaif010@gmail.com)

</div>

---

## The art of a simple curve

Two quarter-circle arcs. One tile. Infinite possibilities.

**Truchet Weave Background** transforms a field of geometric tiles into a shifting visual maze. Organic-looking waves ripple through an ordered grid, while pointer movement gently rotates nearby tiles. It brings generative-art character to portfolios, landing pages, and interactive brand experiences—all inside Framer.

**▶ [See the interactive live demo](https://truchetweavebackground.framer.website/)**

## ✨ Highlights

| Feature | Experience |
| --- | --- |
| 🌀 Animated Truchet geometry | Quarter-circle tiles rotate into continuously changing patterns |
| 🎛 Five wave presets | Classic, Diagonal, Ripple, Flow, and Calm |
| 🖱 Cursor interaction | Adjustable influence radius, rotation strength, and smoothing |
| 🎨 Custom styling | Arc color, background, stroke thickness, and tile density |
| 🛑 Cursor-only mode | Set **Speed** to **0** for an interactive but otherwise still canvas |
| 📱 Responsive | Automatically adapts to its Framer container |
| ♿ Reduced motion | Uses a static SVG rendering when motion is reduced |
| ⚡ Rendering safeguards | DPR cap, grid-density limit, visibility pause, and cleanup |
| 🖼 Static previews | Deterministic SVG fallback for static rendering |

## 🚀 Get started in Framer

1. Open your project in [Framer](https://www.framer.com/).
2. Add a new code component named `KarimSaifTruchetWeaveBackground.tsx`.
3. Copy the source from [`KarimSaifTruchetWeaveBackground.tsx`](./KarimSaifTruchetWeaveBackground.tsx).
4. Paste the code into Framer and insert the component onto your canvas.
5. Resize it to fill your desired hero, section, or background.
6. Customize the effect with the property controls.

No third-party animation package, paid library, or external image assets are required.

## 🎛 Customization

| Property | Default | What it does |
| --- | --- | --- |
| Arc Color | `#E5484D` | Changes the drawn arcs |
| Background | `#F3EEE4` | Sets the canvas background |
| Wave Preset | Classic | Chooses the wave-field behavior |
| Tile Size | 40px | Changes detail and density |
| Stroke Width | 20% | Adjusts line thickness |
| Speed | 1 | Controls automatic animation |
| Paused | Off | Stops animation and interaction |
| Cursor | On | Toggles pointer response |
| Cursor Radius | 160px | Sets the area of influence |
| Cursor Strength | 1.5 | Adjusts local rotation |
| Cursor Smoothness | 12 | Controls response and settling |

### Wave presets

**Classic** — Layers several directional waves into a dynamic maze.  
**Diagonal** — Sends motion along diagonals.  
**Ripple** — Radiates outward from the grid's origin.  
**Flow** — Combines intersecting wave fields.  
**Calm** — Uses slower, softer motion.

## 💡 Great for

- Creative and experimental portfolios
- Agency and studio homepages
- SaaS and product launch pages
- Generative-art showcases
- Interactive hero sections
- Editorial and design-forward websites

## 🧩 Implementation notes

The component uses Framer's `addPropertyControls`, `useIsStaticRenderer`, and `useReducedMotion` APIs. Interactive drawing uses Canvas 2D, and static/reduced-motion output uses SVG. It includes `IntersectionObserver` offscreen pausing, page-visibility pausing, resize handling, and animation-frame cleanup.

The repository contains portable source for use within Framer. Actual behavior and Marketplace acceptance should be verified in the Framer editor and published site.

## 🔗 Links

- 🌐 **[Live Preview](https://truchetweavebackground.framer.website/)**
- 🧑‍💻 **[GitHub Repository](https://github.com/karimsaif0/Truchet-Weave-Background-Framer-Component-)**
- ✦ **[Follow Karim Saif on X](https://x.com/karimsaif0)**
- ✉️ **[Email Support](mailto:karimsaif010@gmail.com)**

## 💛 Support

Made with 💛 by **Karim Saif**.

Questions, suggestions, or a project you'd like to share? Reach out on [X](https://x.com/karimsaif0) or email **[karimsaif010@gmail.com](mailto:karimsaif010@gmail.com)**.

---

<div align="center"><strong>Make geometry move. Make your website memorable.</strong></div>
