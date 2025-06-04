# Numbering System Update: 1-120 Display

## Overview
Updated the entire application to display inputs and outputs as 1-120 instead of 0-119, while maintaining internal protocol compliance (0-119).

## Changes Made

### ✅ Client-Side Updates

#### 1. New Utility Functions (`utils/numberUtils.js`)
- `formatDisplayNumber(internal)` - Converts 0-119 → 001-120 display
- `parseDisplayNumber(display)` - Converts 1-120 → 0-119 internal  
- `getDefaultLabel(type, internal)` - Generates "Input 1", "Output 1" etc.
- `validateDisplayInputRange()` - Validates 1-120 display range
- `validateDisplayOutputRange()` - Validates 1-120 display range

#### 2. Component Updates
- **DestinationCard**: Shows "OUT 001:", "IN 001:" format
- **ChangeSourceModal**: Input selection with 1-120 numbering
- **CreatePresetModal**: Manual route builder uses 1-120 inputs
- **MatrixGrid**: Legacy component updated for consistency
- **RoutingView**: Uses new labeling functions

#### 3. Input Validation
- Manual route creation: Accepts 1-120, converts to 0-119 internally
- Search functionality: Finds by both display numbers and labels
- Form placeholders: Show "1-120" ranges

### ✅ Server-Side Updates

#### 1. Configuration (`server/config.js`)
- Updated comments to clarify internal vs display numbering
- Default labels remain keyed by internal index (0-119)
- Display shows as Camera 1, Output 1, etc.

#### 2. Protocol Compliance
- Internal communication remains 0-119 (Blackmagic protocol)
- WebSocket messages use internal numbering
- No changes to TCP bridge functionality

### ✅ User Interface Impact

#### Before Update
- Inputs: 000-119
- Outputs: 000-119  
- Default labels: "Input 0", "Output 0"

#### After Update
- Inputs: 001-120
- Outputs: 001-120
- Default labels: "Input 1", "Output 1"

### Examples

#### Route Display
```
Before: OUT 000: Main Monitor → SRC 000: Camera 1
After:  OUT 001: Main Monitor → IN 001: Camera 1
```

#### Manual Route Creation
```
Before: Output 0-119, Input 0-119
After:  Output 1-120, Input 1-120
```

#### Search Results
```
Before: "IN 000: Camera 1"
After:  "IN 001: Camera 1"
```

## Technical Implementation

### Protocol Layer (Unchanged)
- VideoHub protocol: Still uses 0-119 internally
- WebSocket messages: Still use 0-119 indexing
- Route storage: Still keyed by 0-119

### Display Layer (Updated)
- All user-facing components show 1-120
- Automatic conversion between internal/display
- Form inputs validate 1-120 ranges

### Benefits
1. **User-Friendly**: Matches broadcast industry convention (1-based)
2. **Protocol Compliant**: Maintains Blackmagic compatibility
3. **Consistent**: All components use same numbering
4. **Backwards Compatible**: No breaking changes to API

## Files Modified
- `client/src/utils/numberUtils.js` (new)
- `client/src/components/DestinationCard.jsx`
- `client/src/components/ChangeSourceModal.jsx`
- `client/src/components/CreatePresetModal.jsx`
- `client/src/components/MatrixGrid.jsx`
- `client/src/components/RoutingView.jsx`
- `server/config.js` (comments updated)

## Testing
- Manual route creation now accepts 1-120
- Search works with new display numbers
- All existing functionality preserved
- Protocol communication unaffected

The update provides a more intuitive user experience while maintaining full technical compatibility with the Blackmagic VideoHub protocol.