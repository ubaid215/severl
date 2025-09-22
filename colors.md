# SEVERAL Brand Color Palette

## Primary Colors (From Logo)

### **Vibrant Red**
- **Primary Red**: `#E53E3E` / `#DC2626`
- **Usage**: Main brand color, CTAs, alerts, accent elements
- **Psychology**: Energy, appetite stimulation, urgency

### **Golden Yellow/Orange**
- **Primary Gold**: `#F6AD55` / `#F59E0B`
- **Usage**: Secondary actions, highlights, warm accents
- **Psychology**: Warmth, happiness, appetite appeal

### **Deep Navy/Dark Blue**
- **Primary Navy**: `#2D3748` / `#1E293B`
- **Usage**: Text, headers, professional elements 
- **Psychology**: Trust, stability, premium feel

### **Pure White**
- **Background White**: `#FFFFFF`
- **Usage**: Backgrounds, contrast, clean space

## Extended Palette Suggestions

### **Supporting Colors**
- **Light Gray**: `#F7FAFC` - Subtle backgrounds
- **Medium Gray**: `#718096` - Secondary text
- **Success Green**: `#38A169` - Order confirmations, success states
- **Warning Orange**: `#DD6B20` - Warnings, notifications
- **Error Red**: `#E53E3E` - Error states (matches primary)

### **Gradient Combinations**
- **Hero Gradient**: Red to Gold `linear-gradient(135deg, #E53E3E 0%, #F59E0B 100%)`
- **Card Gradient**: Light variations for subtle depth
- **Button Gradient**: Darker variations for hover states

## Color Usage Guidelines

### **Primary Actions**
- **Order Now/Add to Cart**: Red background with white text
- **Secondary Actions**: Gold background with white text
- **Neutral Actions**: Navy with white text

### **Text Hierarchy**
- **Headings**: Navy (`#1E293B`)
- **Body Text**: Dark Gray (`#374151`)
- **Secondary Text**: Medium Gray (`#6B7280`)
- **Captions**: Light Gray (`#9CA3AF`)

### **Status Colors**
- **Order Pending**: Gold (`#F59E0B`)
- **Order Confirmed**: Green (`#10B981`)
- **Order Delivered**: Green (`#059669`)
- **Order Cancelled**: Red (`#DC2626`)

### **Background Variations**
- **Page Background**: Pure White (`#FFFFFF`)
- **Card Background**: Off-white (`#FAFAFA`)
- **Section Background**: Light Gray (`#F9FAFB`)
- **Admin Panel**: Navy with white cards

## Brand Personality Reflection

Your logo suggests:
- **Premium yet Approachable**: The clean typography with vibrant colors
- **Energy & Appetite**: Red-gold combination is perfect for food
- **Professional**: The navy adds sophistication
- **Life & Vibrancy**: Matches "THE TASTE OF LIFE" tagline

## CSS Custom Properties Setup (Dark Theme)

```css
:root {
  /* Primary Brand Colors */
  --color-primary: #E53E3E;
  --color-secondary: #F59E0B;
  --color-navy: #1E293B;
  
  /* Dark Theme Backgrounds */
  --bg-primary: #0F0F0F;
  --bg-secondary: #1F2937;
  --bg-tertiary: #374151;
  --bg-elevated: #2A2A2A;
  
  /* Dark Theme Status Colors */
  --color-success: #22C55E;
  --color-warning: #F97316;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  /* Dark Theme Text */
  --text-primary: #FFFFFF;
  --text-secondary: #F3F4F6;
  --text-muted: #D1D5DB;
  --text-disabled: #6B7280;
  
  /* Borders & Dividers */
  --border-primary: #4B5563;
  --border-secondary: #374151;
  --divider: #1F2937;
}

/* Food Category Colors (Dark Theme) */
:root {
  --category-appetizers: #F59E0B;
  --category-mains: #E53E3E;
  --category-desserts: #EC4899;
  --category-beverages: #06B6D4;
  --category-specials: linear-gradient(135deg, #E53E3E 0%, #F59E0B 100%);
}
```

## Dark Theme Advantages for Food Ordering

### **Visual Impact**
- **Food Photos Pop**: Dark backgrounds make colorful food images more vibrant
- **Premium Feel**: Creates upscale restaurant atmosphere
- **Less Eye Strain**: Better for evening ordering sessions
- **Modern Aesthetic**: Appeals to younger demographics

### **Brand Consistency**
- **Logo Integration**: Your logo already works perfectly on dark backgrounds
- **Red-Gold Contrast**: Colors become more striking against dark
- **Professional Appeal**: Matches high-end restaurant branding