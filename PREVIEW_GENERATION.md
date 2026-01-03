# Preview Generation

The `generate_preview.py` script automatically regenerates `preview.html` from the actual template file, keeping it in sync with any template changes.

## Quick Start

```bash
python generate_preview.py
```

This will:
1. Read `templates/actor-sheet.html` (the actual Foundry template)
2. Render Handlebars expressions using sample data
3. Embed `styles/pgte.css` into the HTML
4. Generate `preview.html` with the rendered output

## Customizing Preview Data

Edit the `SAMPLE_DATA` dictionary at the top of `generate_preview.py` to change what appears in the preview:

```python
SAMPLE_DATA = {
    "name": "Character Name",
    "personalName": "Real Name",
    "archetype": "Character description",
    
    "stats": {
        "SORCERY": {"uses": "...", "die": "d4"},
        # etc...
    },
    
    "resources": {
        "hits": {
            "physical": {"value": 3, "max": 6},
            "mental": {"value": 1, "max": 4}
        },
        "storyTokens": {"value": 2},
        "storyDie": {"value": "d6"}
    },
    
    "aspects": [
        {"name": "Aspect 1", "nature": "Description"},
        # etc...
    ]
}
```

Then run the script again to regenerate the preview.

## How It Works

The script:
- Uses regex patterns to find and replace Handlebars expressions
- Implements helpers like `{{#times}}`, `{{#if}}`, `{{subtract}}`, `{{eq}}`
- Supports nested data path expressions like `system.resources.hits.physical.value`
- Preserves all CSS and HTML structure from the actual template

## Why This Approach?

This keeps the preview:
- **In sync**: Changes to template/CSS are automatically reflected
- **Accurate**: Shows exactly what Foundry will render
- **Maintainable**: No need to manually keep preview.html updated
- **Testable**: Easy to try different sample data without editing HTML

## Workflow

1. Make changes to `templates/actor-sheet.html` or `styles/pgte.css`
2. Run `python generate_preview.py`
3. Open `preview.html` in your browser to see the result
4. Commit both the template changes and the regenerated preview
