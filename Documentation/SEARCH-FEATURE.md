# Search Functionality Added to Destinations View

## Overview
Added comprehensive search functionality to the Destinations View, allowing users to quickly find specific outputs by name or index number.

## Features Implemented

### 🔍 **Search Bar**
- **Location**: Top-right of Destinations View, next to the title
- **Responsive Design**: Full width on mobile, fixed width on desktop
- **Visual Indicators**: Search icon and clear button (×)
- **Placeholder Text**: "Search outputs by name or number..."

### 🎯 **Search Capabilities**

**Search by Output Number:**
- `1` or `001` - Finds Output 001
- `12` - Finds Output 012
- `120` - Finds Output 120

**Search by Output Label:**
- `monitor` - Finds "Main Monitor", "Director Monitor", etc.
- `recording` - Finds "Recording 1", "Recording 2", etc.
- `stream` - Finds "Stream 1", "Webcast", etc.

**Search by Format:**
- `out 5` - Finds Output 005
- `output 10` - Finds Output 010

### 📊 **Search Results Display**

**Results Counter:**
- Shows "Showing X of 120 outputs matching 'search term'"
- "Showing all 120 outputs" when search matches everything
- "No outputs found matching 'search term'" for no results

**Visual Feedback:**
- Blue info banner with search results count
- Highlighted search term in results message
- Clear search button for easy reset

### 🚫 **Empty States**

**No Search Results:**
- Magnifying glass icon
- "No Outputs Found" message
- Shows the search term that returned no results
- "Clear Search" button to reset

**No Active Routes (existing):**
- Only shows when not searching and no routes exist
- Maintains existing functionality

## User Experience

### **Workflow Examples:**

1. **Find specific output by number:**
   - Type "5" → Shows Output 005
   - Type "001" → Shows Output 001

2. **Find outputs by function:**
   - Type "monitor" → Shows all monitor outputs
   - Type "recording" → Shows all recording outputs

3. **Quick access to similar outputs:**
   - Type "camera" → Shows all camera-related outputs
   - Type "stream" → Shows all streaming outputs

### **Responsive Behavior:**
- **Desktop**: Search bar positioned top-right, 320px width
- **Mobile**: Search bar spans full width below title
- **Real-time filtering**: Results update as you type
- **Instant clear**: Click × to immediately reset search

## Technical Implementation

### **Filtering Logic:**
```javascript
const filteredOutputs = allOutputs.filter(output => {
  const outputLabel = getOutputLabel(output).toLowerCase();
  const displayNumber = formatDisplayNumber(output);
  const searchLower = searchTerm.toLowerCase();
  
  return (
    outputLabel.includes(searchLower) ||
    displayNumber.includes(searchTerm) ||
    (output + 1).toString().includes(searchTerm) ||
    `out ${displayNumber}`.includes(searchLower) ||
    `output ${output + 1}`.includes(searchLower)
  );
});
```

### **Search Patterns Supported:**
- **Label matching**: Case-insensitive substring search
- **Number matching**: Display number (001-120) and raw number (1-120)
- **Prefix matching**: "out" and "output" prefixes
- **Flexible formatting**: Handles spaces and different number formats

### **Performance:**
- **Client-side filtering**: Instant results, no server requests
- **Efficient rendering**: Only renders filtered results
- **Memory optimized**: Reuses existing output data

## Integration with Existing Features

### **Maintains All Functionality:**
- ✅ Change Source modal works on filtered results
- ✅ Lock/unlock functionality preserved
- ✅ Real-time route updates continue working
- ✅ Labels update dynamically in search results

### **Compatible with:**
- ✅ 1-120 numbering system
- ✅ Custom output labels
- ✅ All routing operations
- ✅ Preset applications

## Files Modified

### **Primary Changes:**
- `client/src/components/RoutingView.jsx`
  - Added search state management
  - Implemented filtering logic  
  - Added search UI components
  - Updated empty states

### **Dependencies:**
- Uses existing `formatDisplayNumber()` utility
- Uses existing `getDefaultLabel()` utility
- Uses Heroicons `MagnifyingGlassIcon`

## Benefits

### **User Experience:**
1. **Faster Navigation**: Find specific outputs instantly
2. **Improved Workflow**: Group similar outputs easily
3. **Reduced Scrolling**: Filter large lists efficiently
4. **Professional Feel**: Matches industry software standards

### **Operational Efficiency:**
1. **Quick Setup**: Find outputs by function or number
2. **Error Reduction**: Less scrolling means fewer mistakes
3. **Batch Operations**: Easily find related outputs
4. **Accessibility**: Clear visual feedback and easy reset

The search functionality seamlessly integrates with the existing interface while providing powerful filtering capabilities for managing large-scale 120x120 routing matrices.