# Preview Generation Guide

## Overview
The `preview.html` file is a static HTML preview that shows what the PGTE character sheet looks like with actual styling applied. It's useful for:

- Visualizing the current state of the sheet without opening Foundry VTT
- Verifying layout and styling changes
- Sharing with team members who don't have the system installed
- Quickly checking how changes affect the overall look

## How to Regenerate the Preview

### Option 1: Manual Update (Simple)
1. Open `preview.html` in a browser (double-click or drag to browser)
2. The file already has sample data populated
3. Make edits to the HTML inline if needed

### Option 2: Using PowerShell Script (Automated)
Save this as `generate-preview.ps1` in the system root directory:

```powershell
# generate-preview.ps1
# Regenerates preview.html based on current template and styles

$templateFile = "templates/actor-sheet.html"
$cssFile = "styles/pgte.css"
$outputFile = "preview.html"

# Read current CSS
$css = Get-Content $cssFile -Raw

# Generate the HTML with current styling
$previewHtml = @"
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PGTE RPG System - Character Sheet Preview</title>
  <style>
    $css
  </style>
</head>
<body>
  <div class="container">
    <!-- [Preview content would go here] -->
  </div>
</body>
</html>
"@

$previewHtml | Set-Content $outputFile
Write-Host "Preview updated: $outputFile"
```

Run with:
```powershell
.\generate-preview.ps1
```

## When to Regenerate

After making changes to:
- **CSS** (`styles/pgte.css`) - Colors, spacing, layout
- **Major template updates** (`templates/actor-sheet.html`) - New sections or structure

**DO NOT** regenerate for:
- Minor JavaScript changes
- Data structure changes (these don't affect UI)

## Manual Customization

The preview.html file contains sample data that you can edit directly:
- Character name: "Sample Character"
- Stats: Pre-selected die values
- Aspects: Sample text
- Items: Sample inventory

These are for demonstration purposes and don't sync with the actual system.

## Current Preview Features

✓ Full character sheet layout  
✓ All stats table with die selection  
✓ Four-column resources layout (Physical Hits, Mental Hits, Story Tokens, Story Die)  
✓ Three-column aspects grid  
✓ Magical items section with roll buttons  
✓ Items inventory list  
✓ Pattern of Three notes  
✓ Proper CSS variable styling  
✓ Hit marker visualization (● for filled, ○ for empty)  
✓ Sample data with realistic character info  

## Debugging the Preview

If the preview doesn't match the actual sheet:

1. Check that CSS variables are defined in `:root` selector
2. Verify all class names match between template and styles
3. Confirm no CSS is cached (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
4. Check browser console for any CSS errors (F12)

## Future Enhancements

Could add:
- JavaScript to show/hide mental hits when CSS var changes
- Dark/light theme toggle
- Mobile responsiveness testing
- Export as PDF screenshot
