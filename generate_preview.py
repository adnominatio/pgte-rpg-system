#!/usr/bin/env python3
"""
Generate preview.html from templates/actor-sheet.html with sample data.
This script regenerates the preview each time it's run, keeping it in sync with the template.

USAGE:
  python generate_preview.py

This will:
  1. Read templates/actor-sheet.html
  2. Render Handlebars expressions with SAMPLE_DATA
  3. Embed styles/pgte.css
  4. Generate preview.html

TO CUSTOMIZE:
  Edit the SAMPLE_DATA dict below to change what appears in the preview.
  Then run the script again to regenerate preview.html.
"""

import re
import os
from pathlib import Path

# Sample character data - modify this to change preview output
SAMPLE_DATA = {
    "name": "Elusive Counselor",
    "personalName": "Thaddeus Blackwood",
    "archetype": "A cunning merchant with a talent for deception and a secret past",
    
    "stats": {
        "SORCERY": {"uses": "magical ability, arcane knowledge, bindings, rituals", "die": "d4"},
        "LIES": {"uses": "stealth, flattery, charisma, deception", "die": "d6"},
        "VIOLENCE": {"uses": "combat, weapons, physical threats", "die": "d4"},
        "BODY": {"uses": "endurance, agility, strength", "die": "d8"},
        "MIND": {"uses": "knowledge, investigation, quick-thinking", "die": "d6"},
        "HEART": {"uses": "insight, foresight, people skills, Story-awareness", "die": "d6"},
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
        {
            "name": "Beguile",
            "nature": "Like a silver tongue, able to spin webs of deception and false trust"
        },
        {
            "name": "Hide",
            "nature": "Able to blend in or vanish in plain sight. Not actual invisibility, but few people will be able to see you."
        },
        {
            "name": "",
            "nature": ""
        }
    ]
}

class HandlebarsRenderer:
    """Simple Handlebars template renderer for our specific use case."""
    
    def __init__(self, data):
        self.data = data
    
    def _eval_expr(self, expr):
        """Evaluate a simple expression like 'system.resources.hits.physical.value'."""
        expr = expr.strip()
        
        # Handle subtract expressions
        if expr.startswith('subtract '):
            parts = expr[9:].split()
            if len(parts) >= 2:
                a = self._eval_expr(parts[0])
                b = self._eval_expr(parts[1])
                return int(a) - int(b)
            return 0
        
        # Handle parenthesized expressions
        if expr.startswith('(') and expr.endswith(')'):
            return self._eval_expr(expr[1:-1])
        
        # Handle simple numbers
        try:
            return int(expr)
        except ValueError:
            pass
        
        # Handle paths like system.resources.hits.physical.value
        if expr.startswith('system.resources.'):
            parts = expr.replace('system.resources.', '').split('.')
            value = self.data.get('resources', {})
            for part in parts:
                if isinstance(value, dict):
                    value = value.get(part)
                else:
                    return 0
            return value if value is not None else 0
        
        return 0
    
    def render(self, template):
        """Render the template with sample data."""
        result = template
        
        # Handle {{#times n}} ... {{/times}} blocks first
        max_iterations = 100  # Prevent infinite loops
        iteration = 0
        while '{{#times' in result and iteration < max_iterations:
            iteration += 1
            # Find {{#times expression}}
            match = re.search(r'\{\{#times\s+([^}]+)\}\}', result)
            if not match:
                break
            
            count_expr = match.group(1).strip()
            count = self._eval_expr(count_expr)
            
            # Find the matching {{/times}}
            start_pos = match.end()
            close_tag = result.find('{{/times}}', start_pos)
            
            if close_tag == -1:
                break
            
            inner_content = result[start_pos:close_tag]
            repetitions = inner_content * int(count)
            
            # Replace the entire block
            result = result[:match.start()] + repetitions + result[close_tag + 10:]
        
        # Handle {{#if}} blocks
        while '{{#if' in result:
            match = re.search(r'\{\{#if\s+\(eq\s+([^)]+)\)\}\}', result)
            if not match:
                break
            
            condition = match.group(1).strip()
            parts = condition.split()
            if len(parts) >= 2:
                left = self._eval_expr(parts[0])
                right = parts[1].strip('"\'')
                
                # Find {{/if}}
                start_pos = match.end()
                close_tag = result.find('{{/if}}', start_pos)
                if close_tag == -1:
                    break
                
                inner_content = result[start_pos:close_tag]
                
                if str(left) == right:
                    result = result[:match.start()] + inner_content + result[close_tag + 7:]
                else:
                    result = result[:match.start()] + result[close_tag + 7:]
            else:
                break
        
        # Replace simple variable interpolations {{variable}}
        def replace_var(match):
            expr = match.group(1).strip()
            
            # Skip if it looks like a control structure
            if expr.startswith('#') or expr.startswith('/'):
                return match.group(0)
            
            # Handle system.resources.* paths
            if expr.startswith('system.resources.'):
                value = self._eval_expr(expr)
                return str(value) if value is not None else ''
            
            return ''
        
        result = re.sub(r'\{\{([^#/}{]+)\}\}', replace_var, result)
        
        return result


def generate_preview():
    """Generate preview.html from the template and sample data."""
    
    script_dir = Path(__file__).parent
    template_path = script_dir / 'templates' / 'actor-sheet.html'
    css_path = script_dir / 'styles' / 'pgte.css'
    preview_path = script_dir / 'preview.html'
    
    # Read template
    with open(template_path, 'r', encoding='utf-8') as f:
        template_html = f.read()
    
    # Read CSS
    with open(css_path, 'r', encoding='utf-8') as f:
        css_content = f.read()
    
    # Create renderer and render template
    renderer = HandlebarsRenderer(SAMPLE_DATA)
    rendered_html = renderer.render(template_html)
    
    # Build the preview HTML with embedded CSS
    preview_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PGTE Character Sheet Preview</title>
  <style>
{css_content}
  </style>
</head>
<body>
  <div class="preview-container">
    <div class="preview-header">
      <h1>PGTE Character Sheet Preview</h1>
      <p>Auto-generated from template - refresh this script to update</p>
    </div>

    <form class="pgte">
{rendered_html}
    </form>
  </div>
</body>
</html>
"""
    
    # Write preview
    with open(preview_path, 'w', encoding='utf-8') as f:
        f.write(preview_html)
    
    print(f"✓ Generated preview.html ({len(preview_html)} bytes)")
    return preview_path


if __name__ == '__main__':
    try:
        preview_file = generate_preview()
        print(f"✓ Preview saved to {preview_file}")
    except Exception as e:
        print(f"✗ Error generating preview: {e}")
        import traceback
        traceback.print_exc()
