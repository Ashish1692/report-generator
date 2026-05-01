Absolutely. Below is a **detailed technical document** you can reuse as context with other AI systems (or engineers) to diagnose and fix vertical layout issues in `docx`-generated Word templates.

You can copy this as-is into another AI session.

---

# 📘 DOCX Vertical Rendering / Table Collapse Issue  
## Diagnosis & Permanent Fix Guide

---

# 1️⃣ Problem Overview

## ✅ Symptom

When generating `.docx` files using the `docx` library:

- Tables render vertically
- Text appears stacked letter-by-letter
- Headers appear like:

```
R
i
s
k
D
e
s
c
r
i
p
t
i
o
n
```

- Entire document looks compressed or vertically collapsed
- Cover banners collapse
- Columns appear extremely narrow

---

# 2️⃣ Root Cause

This is NOT a font issue.  
This is NOT a text wrapping issue.  

It is a **Word table layout auto-calculation issue**.

Microsoft Word:

- Recalculates table layout unless explicitly forced
- Ignores partial width definitions
- Collapses tables when column widths are ambiguous
- Auto-adjusts columns when layout is not fixed

When Word cannot determine stable column widths:

→ It shrinks columns  
→ Forces text to wrap at character level  
→ Stacks letters vertically  

---

# 3️⃣ Why This Happens in `docx`

Most common structural mistakes:

---

## ❌ Missing `layout: "fixed"`

Without:

```js
layout: "fixed"
```

Word uses **auto layout mode**.

Auto layout causes:
- Width recalculation
- Column shrinking
- Vertical stacking

---

## ❌ Missing `columnWidths`

Even if table width is defined:

```js
width: { size: 9360, type: WidthType.DXA }
```

If `columnWidths` is missing:

Word guesses column widths.

That guess is often wrong.

---

## ❌ Column widths do not equal table width

If:

```js
columnWidths: [4000, 1200, 3000]
```

But total ≠ 9360

Word recalculates.

Recalculation → collapse risk.

---

## ❌ Mixing DXA and Percentage widths

Example of problematic mix:

```js
width: { size: 100, type: WidthType.PERCENTAGE }
columnWidths: [2000, 3000]
```

This causes instability.

---

## ❌ Very Narrow Columns (<1200 DXA)

If column width is too small:

Word wraps each character.

---

## ❌ No Explicit TableCell Width

If only `columnWidths` exist but cell width is missing,
some Word versions recalc layout.

---

# 4️⃣ How To Diagnose The Issue

When a document renders vertically:

### Step 1 — Check Every Table

Search for:

```js
new Table({
```

For each one verify:

- Does it have `layout: "fixed"`?
- Does it define `columnWidths`?
- Do columnWidths sum to CW?
- Is CW consistent with page margins?

---

### Step 2 — Verify Page Width Calculation

Standard setup:

```
Page width: 12240
Margins: 1080 left + 1080 right
Content width (CW) = 12240 - 2160 = 10080
```

If using 9360:

Margins may differ.

CW must match actual content area.

---

### Step 3 — Check for Mixed Width Types

Avoid mixing:

- DXA + Percentage
- Some tables using percentage
- Others using DXA

Use one system consistently.

---

### Step 4 — Check for Missing ColumnWidths

This is the #1 cause.

If missing:

```js
columnWidths: [...]
```

That table is unstable.

---

# 5️⃣ Permanent Structural Fix

## ✅ Rule 1 — Always Use Fixed Layout

Every table must include:

```js
layout: "fixed"
```

---

## ✅ Rule 2 — Always Define Column Widths

Example:

```js
columnWidths: [4200, 1400, 3760]
```

---

## ✅ Rule 3 — Column Width Sum Must Equal CW

If:

```
CW = 9360
```

Then:

```
4200 + 1400 + 3760 = 9360 ✅
```

If not equal → Word recalculates.

---

## ✅ Rule 4 — Use a Table Factory

Implement once:

```js
function createFullWidthTable({ CW, columnWidths, rows }) {
    const total = columnWidths.reduce((a, b) => a + b, 0);

    const adjusted =
        total === CW
            ? columnWidths
            : columnWidths.map(w => Math.floor((w / total) * CW));

    return new Table({
        width: { size: CW, type: WidthType.DXA },
        layout: "fixed",
        columnWidths: adjusted,
        rows
    });
}
```

Replace ALL:

```js
new Table(...)
```

With:

```js
createFullWidthTable(...)
```

---

# 6️⃣ How To Fix Existing Templates

You do NOT need to rewrite each template fully.

### Apply These Tweaks Globally:

1. Add `layout: "fixed"` to all tables
2. Ensure all tables define `columnWidths`
3. Ensure widths sum to CW
4. Remove percentage widths
5. Remove mixed layout systems

If templates share same page layout:

→ One structural adjustment fixes all.

---

# 7️⃣ When Structural Fix Is NOT Enough

You must inspect individually if:

- Different page sizes (A4 vs Letter)
- Landscape sections
- Nested tables
- Merged cells
- Mixed margin settings
- Dynamic column count tables

Otherwise — 95% are structural.

---

# 8️⃣ Safe Universal Table Pattern

```
Table
 ├── width: CW (DXA)
 ├── layout: fixed
 ├── columnWidths: [...]
 └── rows:
       └── TableRow
             └── TableCell
                   ├── width: DXA
                   ├── margins
                   └── Paragraph
```

No shortcuts.

---

# 9️⃣ Quick Checklist For Any New Template

Before shipping:

✅ Does every table use layout: fixed?  
✅ Does every table define columnWidths?  
✅ Do columnWidths sum to CW?  
✅ Are width types consistent (DXA everywhere)?  
✅ Are columns at least 1200 DXA wide?  
✅ Is CW equal to page content width?  

If all true → no vertical collapse.

---

# 🔟 Summary

The vertical stacking issue is caused by:

> Word auto-layout recalculation due to missing or inconsistent table width definitions.

It is a structural problem.

It is NOT random.

It is NOT font related.

It is solved by:

- Fixed layout
- Defined column widths
- Consistent DXA usage
- Matching total widths

---

# ✅ Recommendation For All Future Templates

Create a small internal layout system:

```
Layout.CW
Layout.createTable()
Layout.headerCell()
Layout.dataCell()
```

Never use `new Table()` directly again.

---