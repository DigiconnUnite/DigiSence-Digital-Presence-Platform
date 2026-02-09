# Business Profile Banner Implementation Tasks

## Overview
This document outlines the task breakdown for simplifying and optimizing the business profile banner display and editor in the DigiSence application.

**Project Duration:** Estimated 16-20 hours total
**Priority:** High
**Dependencies:** None (self-contained changes)

---

## Phase 1: Simplify Banner Display

### Task 1.1: Remove Text Overlay Code
**File:** [`src/components/BusinessProfile.tsx`](src/components/BusinessProfile.tsx)
**Status:** ☐ Pending
**Priority:** High
**Estimated Time:** 1 hour

**Description:**
Remove all text overlay related code from the BusinessProfile component including:
- Headline display and rendering logic
- Subheadline display and rendering logic
- CTA button display and rendering logic
- Any related state management for text content

**Acceptance Criteria:**
- [ ] No text overlay elements in banner
- [ ] No related state variables for text content
- [ ] Code compiles without errors

**Notes:**
- Keep the banner image/video display functionality intact
- Preserve any existing media slider logic

---

### Task 1.2: Implement Fixed Sizing with CSS/Tailwind
**File:** [`src/components/BusinessProfile.tsx`](src/components/BusinessProfile.tsx)
**Status:** ☐ Pending
**Priority:** High
**Estimated Time:** 1.5 hours

**Description:**
Apply fixed dimensions to the banner container using Tailwind CSS:

**Desktop Requirements:**
- Width: 100%
- Height: 400px

**Mobile Requirements:**
- Width: 100%
- Height: 250px

**Implementation:**
```css
/* Desktop */
.banner-container {
  @apply w-full h-[400px];
}

/* Mobile (via responsive modifiers) */
.banner-container {
  @apply h-[250px] md:h-[400px];
}
```

**Acceptance Criteria:**
- [ ] Desktop banner height is 400px
- [ ] Mobile banner height is 250px
- [ ] Width remains 100% on all devices
- [ ] Images/videos maintain aspect ratio within container

---

### Task 1.3: Ensure Responsive Design
**File:** [`src/components/BusinessProfile.tsx`](src/components/BusinessProfile.tsx)
**Status:** ☐ Pending
**Priority:** High
**Estimated Time:** 1 hour

**Description:**
Verify and implement responsive design for banner display across all screen sizes.

**Requirements:**
- Mobile: 0-767px (height: 250px)
- Tablet: 768-1023px (height: 300px)
- Desktop: 1024px+ (height: 400px)
- Large Desktop: 1440px+ (height: 400px)

**Acceptance Criteria:**
- [ ] Breakpoints verified in browser dev tools
- [ ] No horizontal scroll on mobile
- [ ] Banner content centers properly on all sizes
- [ ] Images scale appropriately without distortion

---

### Task 1.4: Test Banner Display Across Screen Sizes
**File:** [`src/components/BusinessProfile.tsx`](src/components/BusinessProfile.tsx)
**Status:** ☐ Pending
**Priority:** Medium
**Estimated Time:** 1 hour

**Description:**
Manual testing of banner display functionality across different devices and screen sizes.

**Testing Checklist:**
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet portrait (768x1024)
- [ ] Tablet landscape (1024x768)
- [ ] Mobile iPhone SE (375x667)
- [ ] Mobile iPhone 14 Pro (393x852)
- [ ] Samsung Galaxy S22 (360x780)

**Acceptance Criteria:**
- [ ] All screen sizes render correctly
- [ ] No visual artifacts or clipping
- [ ] Images load properly on all devices

---

## Phase 2: Simplify Banner Editor

### Task 2.1: Remove Style Tab Completely
**File:** [`src/components/ui/banner-editor-modal.tsx`](src/components/ui/banner-editor-modal.tsx)
**Status:** ☐ Pending
**Priority:** High
**Estimated Time:** 1 hour

**Description:**
Remove the entire Style tab from the banner editor modal including:
- Style tab navigation/tab item
- All styling controls (colors, fonts, spacing, etc.)
- Related state management
- Related validation logic

**Acceptance Criteria:**
- [ ] Style tab no longer exists in UI
- [ ] No style-related imports remain
- [ ] Editor navigation only shows Content and Settings (before simplification)

---

### Task 2.2: Remove Settings Tab Completely
**File:** [`src/components/ui/banner-editor-modal.tsx`](src/components/ui/banner-editor-modal.tsx)
**Status:** ☐ Pending
**Priority:** High
**Estimated Time:** 1 hour

**Description:**
Remove the entire Settings tab from the banner editor modal including:
- Settings tab navigation/tab item
- All settings controls (text content, overlay settings, etc.)
- Related state management
- Related validation logic

**Acceptance Criteria:**
- [ ] Settings tab no longer exists in UI
- [ ] No settings-related imports remain
- [ ] Editor navigation only shows Content tab

---

### Task 2.3: Simplify Content Tab to Media Management
**File:** [`src/components/ui/banner-editor-modal.tsx`](src/components/ui/banner-editor-modal.tsx)
**Status:** ☐ Pending
**Priority:** High
**Estimated Time:** 1.5 hours

**Description:**
Streamline the Content tab to focus exclusively on media management.

**Keep:**
- Image upload/deletion
- Image ordering/drag-and-drop
- Video upload/deletion
- Media preview

**Remove:**
- Text content fields (headline, subheadline, CTA)
- Text styling controls
- Any text-related validation

**Acceptance Criteria:**
- [ ] Content tab only shows media controls
- [ ] Image upload works correctly
- [ ] Video upload works correctly
- [ ] Media ordering functionality preserved

---

### Task 2.4: Keep Only Essential Slider Settings
**File:** [`src/components/ui/banner-editor-modal.tsx`](src/components/ui/banner-editor-modal.tsx)
**Status:** ☐ Pending
**Priority:** Medium
**Estimated Time:** 1 hour

**Description:**
Retain only essential slider settings in the simplified editor:

**Keep Settings:**
- Auto-play toggle (boolean)
- Slider interval/speed (number, milliseconds)
- Navigation dots toggle (boolean)
- Arrow navigation toggle (boolean)

**Remove Settings:**
- Transition effects
- Animation speed (beyond interval)
- Slide duration controls
- Any styling-related slider options

**Acceptance Criteria:**
- [ ] Auto-play toggle functional
- [ ] Slider interval configurable
- [ ] Navigation dots toggle functional
- [ ] Arrow navigation toggle functional
- [ ] Settings persist correctly

---

### Task 2.5: Add Video Upload Support (Single Video)
**File:** [`src/components/ui/banner-editor-modal.tsx`](src/components/ui/banner-editor-modal.tsx)
**Status:** ☐ Pending
**Priority:** High
**Estimated Time:** 2 hours

**Description:**
Implement video upload functionality for the banner.

**Requirements:**
- Single video upload (not multiple)
- Supported formats: MP4, WebM, OGG
- Maximum file size: 50MB
- Video preview in media list
- Delete video option
- Auto-play in banner display (muted by default)

**Implementation Notes:**
```typescript
interface VideoSettings {
  url: string;
  autoPlay: boolean;
  muted: boolean;
  loop: boolean;
}
```

**Acceptance Criteria:**
- [ ] Video upload works
- [ ] Video preview displays
- [ ] Video can be deleted
- [ ] Video plays in banner
- [ ] File validation works correctly

---

### Task 2.6: Test Banner Editor Functionality
**File:** [`src/components/ui/banner-editor-modal.tsx`](src/components/ui/banner-editor-modal.tsx)
**Status:** ☐ Pending
**Priority:** Medium
**Estimated Time:** 1 hour

**Description:**
Comprehensive testing of the simplified banner editor.

**Testing Checklist:**
- [ ] Tab navigation works correctly
- [ ] Image upload/delete works
- [ ] Video upload/delete works
- [ ] Media ordering preserved
- [ ] Slider settings apply correctly
- [ ] Auto-save functionality works
- [ ] Cancel/discard changes work
- [ ] Error handling for invalid files

---

## Phase 3: Cleanup Unused Code

### Task 3.1: Remove Hero Component (3D Carousel Demo)
**File:** [`src/components/ui/hero.tsx`](src/components/ui/hero.tsx)
**Status:** ☐ Pending
**Priority:** Low
**Estimated Time:** 0.5 hours

**Description:**
Remove the unused 3D carousel demo hero component.

**Actions:**
- Delete file `src/components/ui/hero.tsx`
- Search for and remove any imports referencing this component
- Verify no compilation errors after removal

**Acceptance Criteria:**
- [ ] File deleted
- [ ] No orphaned imports
- [ ] Build successful

---

### Task 3.2: Remove Hero Section Demo 1
**File:** [`src/components/ui/hero-section-demo-1.tsx`](src/components/ui/hero-section-demo-1.tsx)
**Status:** ☐ Pending
**Priority:** Low
**Estimated Time:** 0.5 hours

**Description:**
Remove the unused hero section demo component.

**Actions:**
- Delete file `src/components/ui/hero-section-demo-1.tsx`
- Search for and remove any imports referencing this component
- Verify no compilation errors after removal

**Acceptance Criteria:**
- [ ] File deleted
- [ ] No orphaned imports
- [ ] Build successful

---

### Task 3.3: Remove Default Hero Template
**File:** [`src/components/sections/hero/default.tsx`](src/components/sections/hero/default.tsx)
**Status:** ☐ Pending
**Priority:** Low
**Estimated Time:** 0.5 hours

**Description:**
Remove the unused default hero template component.

**Actions:**
- Delete file `src/components/sections/hero/default.tsx`
- Search for and remove any imports referencing this component
- Verify no compilation errors after removal

**Acceptance Criteria:**
- [ ] File deleted
- [ ] No orphaned imports
- [ ] Build successful

---

### Task 3.4: Clean Up Orphaned Imports
**Project Wide**
**Status:** ☐ Pending
**Priority:** Medium
**Estimated Time:** 1 hour

**Description:**
Search for and remove any orphaned imports in files related to banner functionality.

**Search Pattern:**
```
hero\.tsx
hero-section-demo-1\.tsx
sections/hero/default
```

**Files to Check:**
- `src/components/ui/banner-editor-modal.tsx`
- `src/components/BusinessProfile.tsx`
- Any index files or barrel exports

**Acceptance Criteria:**
- [ ] No imports reference deleted files
- [ ] All exports updated
- [ ] Build successful

---

## Phase 4: Testing & Validation

### Task 4.1: Test Image Slider Functionality
**Scope:** `src/components/BusinessProfile.tsx`
**Status:** ☐ Pending
**Priority:** High
**Estimated Time:** 1 hour

**Description:**
Comprehensive testing of image slider functionality after banner simplification.

**Testing Checklist:**
- [ ] Multiple images display in slider
- [ ] Image transition works smoothly
- [ ] Image ordering can be changed
- [ ] Images display at correct aspect ratio
- [ ] Empty state shows placeholder

---

### Task 4.2: Test Video Playback
**Scope:** `src/components/BusinessProfile.tsx`
**Status:** ☐ Pending
**Priority:** High
**Estimated Time:** 1 hour

**Description:**
Testing of video playback in the banner.

**Testing Checklist:**
- [ ] Video loads correctly
- [ ] Auto-play works (muted)
- [ ] Loop functionality works
- [ ] Video aspect ratio maintained
- [ ] Fallback image shows when video not loaded

---

### Task 4.3: Validate Responsive Behavior
**Scope:** `src/components/BusinessProfile.tsx`
**Status:** ☐ Pending
**Priority:** High
**Estimated Time:** 1 hour

**Description:**
Validate responsive behavior on desktop and mobile.

**Testing Checklist:**
- [ ] Desktop (1024px+): 400px height
- [ ] Mobile (<768px): 250px height
- [ ] Content scales appropriately
- [ ] No horizontal scrolling
- [ ] Touch interactions work on mobile

---

### Task 4.4: Test Slider Navigation
**Scope:** `src/components/BusinessProfile.tsx`
**Status:** ☐ Pending
**Priority:** Medium
**Estimated Time:** 0.5 hours

**Description:**
Test all slider navigation options.

**Testing Checklist:**
- [ ] Navigation dots visible when enabled
- [ ] Clicking dots changes slide
- [ ] Arrow navigation works
- [ ] Keyboard navigation (left/right arrows)
- [ ] Swipe navigation on mobile

---

### Task 4.5: Cross-Browser Testing
**Scope:** Full Application
**Status:** ☐ Pending
**Priority:** Medium
**Estimated Time:** 1.5 hours

**Description:**
Test banner functionality across multiple browsers.

**Browsers to Test:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Acceptance Criteria:**
- [ ] All browsers render banner correctly
- [ ] Video playback works
- [ ] Slider functionality works
- [ ] No console errors

---

## Dependencies and Notes

### Dependencies
- Banner editor depends on BusinessProfile changes (Phase 1 before Phase 2)
- API routes should remain compatible
- No database schema changes required

### Technical Notes
- All changes use Tailwind CSS for styling
- Component state uses React hooks
- File uploads handled via existing API endpoints
- Video playback uses HTML5 video element

### Potential Risks
- Legacy browser support (IE11 not supported)
- Large video file uploads may require server configuration

### Rollback Plan
- Keep original files in backup branch
- Use version control to revert if needed

---

## Estimated Time Summary

| Phase | Task | Estimated Time |
|-------|------|----------------|
| Phase 1 | 1.1 Remove Text Overlay | 1 hour |
| Phase 1 | 1.2 Implement Fixed Sizing | 1.5 hours |
| Phase 1 | 1.3 Responsive Design | 1 hour |
| Phase 1 | 1.4 Test Display | 1 hour |
| Phase 2 | 2.1 Remove Style Tab | 1 hour |
| Phase 2 | 2.2 Remove Settings Tab | 1 hour |
| Phase 2 | 2.3 Simplify Content Tab | 1.5 hours |
| Phase 2 | 2.4 Essential Slider Settings | 1 hour |
| Phase 2 | 2.5 Video Upload Support | 2 hours |
| Phase 2 | 2.6 Test Editor | 1 hour |
| Phase 3 | 3.1 Remove Hero.tsx | 0.5 hours |
| Phase 3 | 3.2 Remove Hero Demo 1 | 0.5 hours |
| Phase 3 | 3.3 Remove Hero Default | 0.5 hours |
| Phase 3 | 3.4 Cleanup Imports | 1 hour |
| Phase 4 | 4.1 Test Image Slider | 1 hour |
| Phase 4 | 4.2 Test Video Playback | 1 hour |
| Phase 4 | 4.3 Responsive Validation | 1 hour |
| Phase 4 | 4.4 Test Navigation | 0.5 hours |
| Phase 4 | 4.5 Cross-Browser Testing | 1.5 hours |

**Total Estimated Time: 18-20 hours**

---

## Execution Order

### Recommended Execution Sequence:
1. **Phase 1 Tasks (in order)** - Required foundation for Phase 2
2. **Phase 2 Tasks (in order)** - Depends on Phase 1 completion
3. **Phase 3 Tasks** - Can run parallel to Phase 2
4. **Phase 4 Tasks** - After all implementation complete

### Parallel Execution Opportunities:
- Task 3.1, 3.2, 3.3 can run in parallel
- Task 4.1-4.5 can run sequentially or in parallel across devices
