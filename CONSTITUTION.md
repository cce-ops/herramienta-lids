# Herramienta LIDS - Project Constitution

## Vision
A free, offline-first ecodesign diagnosis tool that helps designers and students evaluate products and services using the LIDS (Living Indicator of Design for Sustainability) framework by Brezet & van Hemel.

## Principles

### 1. Offline First
- All functionality works without internet connection
- IA suggestions are optional and use locally-saved API keys only
- No data leaves the user's browser

### 2. Design Agnostic
- Evaluates both physical products and services using the same LIDS framework
- Question text adapts to context while maintaining 8 core dimensions
- Same radar visualization and scoring for both modes

### 3. Privacy by Design
- API keys stored only in current browser's localStorage
- Keys never sent to servers except to the chosen IA provider
- No analytics, tracking, or third-party services

### 4. Open & Accessible
- Zero external dependencies - works as single HTML file
- WCAG AA accessible components (keyboard navigation, ARIA labels, color contrast)
- Spanish language throughout
- No frameworks, no build steps - just open in any browser

### 5. Extensible
- New dimensions, questions, or modes can be added
- IA provider configuration is pluggable
- Local suggestions are versioned and maintainable

### 6. Educational Focus
- Designed for teaching and learning ecodesign
- Results help identify prioritization areas
- Suggestions promote concrete improvement actions

## Technical Constraints (by Design)

- **No build step** - files work directly in browser
- **No runtime dependencies** - vanilla JS, canvas for radar
- **File:// protocol support** - works offline, from local disk
- **Small footprint** - ~15KB JS + 5KB CSS + 11KB HTML
- **Canvas-based radar** - zero dependency, responsive, printer-friendly

## Supported Evaluation Modes

1. **Producto** - Physical product evaluation (original mode)
   - 16 questions across 8 LIDS dimensions
   - Focus: materials, production, distribution, use phase, end-of-life

2. **Servicio** - Service/system evaluation (new mode)
   - Same 8 dimensions, adapted question text
   - Focus: infrastructure, operation, digital distribution, user consumption, service end-of-life

## Development Guidelines

### Adding New Modes
1. Add question set in `app.js` `PREGUNTAS_<MODE>` format
2. Keep same `DIMENSIONES` array index order
3. Adapt question text while preserving `terms` `q` indices
4. Update `dimDePregunta()` if dimension mapping changes

### Adding Questions
1. Add to appropriate `PREGUNTAS_<MODE>` array
2. Ensure each question has `dim` pointing to existing DIMENSIONES `id`
3. Maintain `terms` array with `t` (term) and `q` (question index) properties
4. Keep `OPCIONES` array unchanged (1-5 scale)

### IA Configuration
- Provider stored in `lids_provider` localStorage key
- Model stored in `lids_model_<provider>` localStorage key  
- API key stored in `lids_apikey_<provider>` localStorage key
- Default: Google Gemini with auto model discovery

## Roadmap (Future Considerations)

- [ ] Export to other formats (CSV, Google Sheets integration)
- [ ] UI theme switching (light/dark)
- [ ] Shared question libraries for community contribution
- [ ] Additional IA providers beyond Gemini
- [ ] Template-based product description prompts
- [ ] Multi-language support (English, Spanish, etc.)

## License
Free for educational use. No warranty. Modifications encouraged with attribution.