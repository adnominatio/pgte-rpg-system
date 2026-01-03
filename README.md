# PGTE RPG System for Foundry Virtual Tabletop

A game system implementation for Foundry Virtual Tabletop (FVTT) based on the PGTE (Practical Game Theory Engine) ruleset.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [File Structure](#file-structure)
- [How Systems Operate](#how-systems-operate)
- [System Interactions](#system-interactions)
- [Development Guide](#development-guide)

---

## Overview

This is a complete game system implementation for Foundry Virtual Tabletop. The PGTE RPG System provides:

- Custom data models for Actors (characters/NPCs) and Items
- Specialized UI templates for character sheets and item management
- CSS styling for an immersive game interface
- Localization support for multiple languages
- Compendium packs for pre-generated content

The system is built using:
- **JavaScript (ES Modules)** - Core system logic and data handling
- **HTML Templates** - Actor sheets and item displays (Handlebars syntax)
- **CSS** - Visual styling and layout
- **JSON** - Configuration, localization, and data structure

---

## System Architecture

### Core Components

The PGTE system operates through several interconnected layers:

#### 1. **System Manifest** (`system.json`)
The entry point that tells Foundry VTT how to load and configure your system:
- Defines the system ID, version, and metadata
- Specifies which JavaScript files to load
- Declares CSS stylesheets to include
- Defines actor and item types
- Configures compendium packs
- Sets up languages and localization

#### 2. **Data Models** (`scripts/pgte.js`)
Define the structure of all system-specific data:
- **Actor Data Models**: Define the schema for character types (hero, NPC, etc.)
- **Item Data Models**: Define the schema for equipment, spells, abilities, etc.
- Enforce data validation and structure
- Enable type safety and data migration

#### 3. **Document Implementations**
Custom classes that extend Foundry's base document types:
- `SystemActor` - Custom logic for actor behavior
- `SystemItem` - Custom logic for item behavior
- Can include methods for complex game rules

#### 4. **Templates** (`templates/actor-sheet.html`)
Handlebars templates that define the HTML structure of character sheets:
- Bind to actor data through `{{` `}}` syntax
- Display and edit actor properties
- Create interactive UI elements

#### 5. **Styles** (`styles/pgte.css`)
CSS that controls the visual presentation:
- Layout and spacing
- Colors and typography
- Responsive design
- UI component styling

---

## File Structure

```
pgte-rpg-system/
├── system.json                 # System manifest and configuration
├── scripts/
│   ├── pgte.js                # Main system initialization and logic
│   └── pgte-old.js            # Legacy/backup code
├── templates/
│   ├── actor-sheet.html       # Character sheet template
│   └── actor/
│       ├── character.json     # Character type schema
│       └── npc.json           # NPC type schema
├── styles/
│   └── pgte.css              # System stylesheets
├── lang/
│   └── en.json               # English localization
├── preview.html              # Preview for the system browser
└── README.md                 # This file
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `system.json` | Declares system metadata, document types, and entry points |
| `scripts/pgte.js` | Initializes the system, registers data models and document classes |
| `templates/actor-sheet.html` | Handlebars template for rendering actor character sheets |
| `templates/actor/*.json` | JSON schema definitions for actor types |
| `styles/pgte.css` | All visual styling for the system |
| `lang/en.json` | Localization strings for UI labels |

---

## How Systems Operate

### System Initialization Flow

When Foundry VTT loads your system, the following happens:

1. **Manifest Loading** (`system.json`)
   - Foundry reads `system.json` and verifies compatibility
   - Declares what document types this system provides
   - Specifies which files to load (JavaScript, CSS, languages)

2. **JavaScript Execution** (`scripts/pgte.js`)
   - System initialization code runs when `init` hook fires
   - Data models are registered via `CONFIG.Actor.dataModels` and `CONFIG.Item.dataModels`
   - Custom document classes are registered via `CONFIG.Actor.documentClass` and `CONFIG.Item.documentClass`
   - Localization strings are loaded from `lang/en.json`

3. **Document Type Registration**
   - System declares which actor types (character, npc) are valid
   - System declares which item types are supported
   - Each type is mapped to a specific Data Model that defines its schema

4. **Template and Style Loading**
   - CSS files are automatically injected into the HTML
   - Templates are registered and become available for rendering

### Document Lifecycle

When an actor is created in-game:

```
Create Request
    ↓
Data Model Schema Applied
    ↓
Data Validation
    ↓
prepareBaseData() called (base calculations)
    ↓
Embedded Items/Effects Processed
    ↓
prepareDerivedData() called (derived values)
    ↓
Document Ready for Use
```

### Actor Data Structure Example

```javascript
{
  "_id": "unique-id",
  "name": "Character Name",
  "type": "character",      // Determines which data model applies
  "img": "path/to/image",
  "system": {               // System-specific data
    "resources": {
      "hits": {
        "physical": {
          "value": 5,
          "max": 10
        },
        "mental": {
          "value": 3,
          "max": 8
        }
      },
      "storyTokens": {
        "value": 2
      },
      "storyDie": {
        "value": "d6"
      }
    }
  },
  "items": [...]            // Embedded items
}
```

---

## System Interactions

### How Components Interact

#### 1. **Data Model → Document Implementation**
```
Data Model defines schema
        ↓
Document Implementation receives typed data
        ↓
Methods can safely access and manipulate data
        ↓
Changes propagated back to database
```

#### 2. **Template → Data Model**
```
Template accesses actor.system properties
        ↓
Handlebars renders with current data
        ↓
User modifies form inputs
        ↓
Changes update document via `name="system.field.path"`
        ↓
Data Model validates and applies changes
```

#### 3. **CSS ↔ Data and Templates**
```
CSS Variables can be dynamically set
        ↓
Template applies CSS classes based on data
        ↓
Styles respond to state changes
        ↓
Users see real-time visual feedback
```

### Example: Hit Points System

The hit tracking demonstrates system integration:

**Data Model** (`scripts/pgte.js`):
```javascript
hits: {
  physical: { value, max },
  mental: { value, max }
}
```

**Template** (`templates/actor-sheet.html`):
```html
<div style="opacity: var(--hits-physical-opacity);">
  <input name="system.resources.hits.physical.max" />
  {{#times system.resources.hits.physical.value}}
    <span class="hit-marker filled">●</span>
  {{/times}}
</div>
```

**Styles** (`styles/pgte.css`):
```css
--hits-physical-opacity: 1;
--hits-mental-opacity: 0;
.hits-control { /* layout and styling */ }
.hit-marker { /* visual representation */ }
```

**Script Logic** (`scripts/pgte.js`):
```javascript
class SystemActor extends Actor {
  async takeDamage(amount, type) {
    // Game logic for applying damage
    // Updates system.resources.hits[type].value
  }
}
```

#### Mental Hits Feature Flag

The system includes a feature-gated **Mental Hits** system that can be enabled for future versions. Currently hidden but fully functional in the code:

**To Enable Mental Hits**, modify `styles/pgte.css`:

```css
:root {
  --hits-mental-display: flex;      /* Show the mental hits column */
  --hits-mental-display-label: 1;   /* Show "(Physical)" label */
}
```

**What This Does:**
- Reveals the "Hits (Mental)" column in the resources section
- Shows the "(Physical)" label next to the physical hits (to distinguish the two types)
- Both mental and physical hits track value and max independently
- Event handlers in JavaScript already support both types

**Use Case:**
This allows the system to be released and used with only physical hits visible, while the mental hits infrastructure is complete and tested. When you're ready to roll out the feature to your campaign:
1. Change the two CSS variables above
2. Optionally update the regeneration text to mention both types
3. The feature becomes immediately available - no code changes needed

The data structure and JavaScript handlers are fully implemented and backward-compatible, so existing campaigns can be upgraded seamlessly.

### Module Compatibility

Systems can depend on and interact with:
- **Other Systems**: Inherit data structures or compatibility
- **Modules**: Add functionality, provide libraries
- **Compendium Packs**: Distribute pre-built content
- **Macros and Journals**: Execute system-specific logic

---

## Development Guide

### Adding New Actor Types

1. **Define in `system.json`**:
   ```json
   "documentTypes": {
     "Actor": {
       "newtype": {}
     }
   }
   ```

2. **Create Data Model** in `scripts/pgte.js`:
   ```javascript
   class NewTypeDataModel extends TypeDataModel {
     static defineSchema() {
       return { /* field definitions */ };
     }
   }
   ```

3. **Register** in initialization:
   ```javascript
   CONFIG.Actor.dataModels.newtype = NewTypeDataModel;
   ```

4. **Create Template** in `templates/actor-sheet.html`:
   - Add conditional sections based on `actor.type`
   - Bind inputs to `system` fields

### Modifying Data Structure

When changing the actor data schema:

1. Update the Data Model's `defineSchema()`
2. Define a `migrateData()` method if restructuring existing data
3. Increment `system.json` version number
4. Document breaking changes in commit messages

### Adding CSS

- Organize styles by section (resources, hits, tokens, etc.)
- Use CSS variables for colors and common values
- Consider responsive design for different screen sizes
- Test with different actor types and data

### Localization

Add strings to `lang/en.json`:
```json
{
  "PGTE.system.label": "Game Label",
  "PGTE.actor.types.character": "Character"
}
```

Reference in templates:
```html
<label>{{localize "PGTE.system.label"}}</label>
```

---

## References

- [Foundry VTT System Development Documentation](https://foundryvtt.com/article/system-development/)
- [Foundry VTT Data Models Guide](https://foundryvtt.com/article/system-data-models/)
- [Handlebars Template Reference](https://handlebarsjs.com/)
- [D&D 5e System (Reference Implementation)](https://github.com/foundryvtt/dnd5e)

---

## Tips for Development

1. **Start Small**: Focus on one document type and data field at a time
2. **Test Regularly**: Create test actors and verify data is saved correctly
3. **Use Browser DevTools**: Inspect rendered HTML and debug JavaScript
4. **Keep Migrations Safe**: Always provide a way to revert data changes
5. **Document Complex Logic**: Add comments explaining game rules
6. **Version Control**: Use meaningful commit messages and track changes
