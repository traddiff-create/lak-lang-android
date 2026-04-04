# Design System — LakLang Android

## Philosophy

Earthy, natural, grounded. The app should feel like sitting with an elder — respectful, substantive, warm. No gamification gimmicks, no stereotypical imagery.

## Color Palette

### Light Theme

| Token | Color | Hex | Usage |
|-------|-------|-----|-------|
| Primary | Earth Brown | `#5D4037` | Headers, primary actions |
| Primary Container | | `#D7C4A7` | Word of the Day card |
| Secondary | Sage Green | `#6B7F5E` | Related words, values |
| Secondary Container | | `#CDD8C4` | Related word chips |
| Tertiary | Deep Sky | `#4A6FA5` | Connected values |
| Background | Cream White | `#FAF3E8` | App background |
| Surface Variant | | `#F0E6D6` | Cards, meaning block |
| On Background | Dark Earth | `#2C1F14` | Primary text |
| Outline | Warm Gray | `#8D7B68` | Borders, secondary text |

### Dark Theme

Inverted warmth — dark earth background (`#1A1410`) with warm sand (`#A67B5B`) primary. Maintains readability of Lakota orthography diacritics.

## Typography

System default (Roboto on Android). Lakota special characters (ą, š, ž, č, ȟ, ġ, ŋ, ʼ) render correctly on Android 8+ with system fonts. If issues arise on specific devices, bundle Noto Sans as fallback.

### Type Scale Usage

| Style | Usage |
|-------|-------|
| Display Small | Word detail: Lakota word |
| Headline Large | Tab headers (LakLang, Stories, Learn, Saved) |
| Headline Medium | Word of the Day |
| Title Medium | Section headers, story titles |
| Body Large | Definitions, story body, cultural module text |
| Body Medium | Phonetic guides, secondary text |
| Label Small | Category chips, exchange counts |

## Components

### Word Card (List Item)
- Headline: Lakota word
- Supporting: English translation
- Trailing: Category chip

### Word of the Day Card
- Primary container background
- "Word of the Day" label (small, 70% opacity)
- Large Lakota word + phonetic guide + English meaning

### Category Chips
- `FilterChip` for category selection
- "All" chip always first
- Horizontal scrolling row

### Spotlight Search
- Full-screen overlay with scrim
- Search field at top, auto-focused
- Results grouped by type with section headers and type icons

### Detail Cards
- Related Words: Secondary container, horizontal scroll
- Connected Values: Tertiary container
- Connected Stories: Default card, clickable
- Pronunciation: Surface variant, tabular layout
