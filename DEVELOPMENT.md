# PGTE RPG System Development Notes

**Internal documentation for updating the system code. NOT for distribution.**

## Critical Rule: Version Bumping

**⚠️ IMPORTANT: Every commit that modifies code MUST bump the version number in `system.json`**

This includes changes to:
- `scripts/pgte.js` (JavaScript logic)
- `templates/actor-sheet.html` (HTML templates)
- `styles/pgte.css` (Stylesheets)
- Any other code files

**Do NOT bump version for:**
- Documentation changes (README.md, this file)
- Pure metadata updates that don't affect functionality

### How to Bump the Version

1. Open `system.json`
2. Locate the `"version"` field
3. Increment the patch version (rightmost number):
   - Example: `1.0.32` → `1.0.33`
   - For major changes: `1.0.33` → `1.1.0` or `2.0.0`
4. Save the file
5. Include the version bump in your commit message

### Commit Message Format

Always include what was changed and reference the version:

```
Brief description of what was changed

- Detail 1
- Detail 2
- Bump version to 1.0.XX
```

---

## System Structure Reference

### Key Files and Their Responsibilities

| File | Role | Changes Require Version Bump? |
|------|------|-----|
| `system.json` | System manifest and configuration | Only if code references change |
| `scripts/pgte.js` | Core JavaScript logic, event handlers | YES |
| `templates/actor-sheet.html` | HTML template for character sheets | YES |
| `styles/pgte.css` | Visual styling and layout | YES |
| `lang/en.json` | Text localization | Typically no, unless critical |
| `README.md` | Public documentation | NO |
| `DEVELOPMENT.md` | This file | NO |

---

## Common Changes and Where They Go

### Adding a New Resource Type
1. Update data structure in `scripts/pgte.js` (getData method)
2. Add HTML template in `templates/actor-sheet.html`
3. Add button handlers in `scripts/pgte.js` (activateListeners)
4. Add CSS styling in `styles/pgte.css`
5. **Bump version**

### Modifying Hit System
The hits system has physical and mental components:

**JavaScript** (`scripts/pgte.js`):
```javascript
// Hits buttons use data-type attribute to determine which hit type to modify
html.find('.hits-up').click(ev => {
  const hitType = ev.currentTarget.dataset.type || 'physical';
  const current = this.actor.system.resources.hits[hitType].value || 0;
  // ... update logic
});
```

**HTML Template** (`templates/actor-sheet.html`):
```html
<button type="button" class="hits-up" data-type="physical">▲</button>
<button type="button" class="hits-down" data-type="mental">▼</button>
```

**CSS** (`styles/pgte.css`):
- Use CSS variables: `--hits-physical-opacity`, `--hits-mental-opacity`
- Control visibility through opacity settings

### Adding New Stats/Abilities
1. Initialize structure in `getData()` method in `scripts/pgte.js`
2. Add UI controls in `templates/actor-sheet.html`
3. Add roll handlers in `scripts/pgte.js` (look for `_onRoll*` methods)
4. Style appropriately in `styles/pgte.css`
5. **Bump version**

---

## Testing Checklist Before Committing

- [ ] Create a test actor to verify data is saved correctly
- [ ] Test all buttons/inputs related to your changes
- [ ] Verify no console errors (check browser DevTools)
- [ ] Confirm old actors still load without errors
- [ ] Test both character and NPC actor types (if applicable)

---

## Version History Reference

| Version | Date | Changes |
|---------|------|---------|
| 1.0.33 | 2026-01-02 | Support separate physical and mental hit tracking |
| 1.0.32 | 2026-01-02 | Improve layout alignment and visibility controls |

---

## Foundry VTT System Architecture Quick Reference

### Document Update Paths
When updating actor data via JavaScript, use dot notation:
```javascript
// Flat structure
this.actor.update({ "system.resources.storyTokens.value": 5 });

// Dynamic paths (for type-based updates like hits)
this.actor.update({ [`system.resources.hits.${hitType}.value`]: 5 });
```

### CSS Variables
Define at top of `pgte.css` in `:root` selector:
```css
:root {
  --hits-physical-opacity: 1;
  --hits-mental-opacity: 0;
}
```

Use in templates via inline styles:
```html
<div style="opacity: var(--hits-physical-opacity, 0.3);">
```

### Handlebars Helpers
Available in templates:
- `{{times n}}` - Loop n times
- `{{subtract a b}}` - Calculate a - b
- `{{eq a b}}` - Compare equality
- `{{localize 'KEY'}}` - Localization strings

---

## Debugging Tips

**Check Console**:
- Open browser DevTools (F12 in most browsers)
- Console tab shows JavaScript errors
- Look for PGTE System log messages

**Inspect Elements**:
- Right-click and "Inspect" to see rendered HTML
- Verify data attributes are present
- Check applied CSS classes and styles

**Test Data Paths**:
```javascript
// In console, with actor selected:
console.log(game.actors.contents[0].system.resources);
```

**Watch for Type Errors**:
- Accessing undefined properties (e.g., `hits[hitType]` when hitType is undefined)
- Always provide fallbacks: `|| 'physical'` or `|| 0`
