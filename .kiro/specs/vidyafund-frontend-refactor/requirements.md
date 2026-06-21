# Requirements Document

## Introduction

This document specifies the requirements for refactoring the VidyaFund AI frontend from a hackathon prototype into a professional, investor-ready SaaS product. The refactoring addresses critical user experience and visual design deficiencies that currently prevent the platform from conveying trust, professionalism, and scalability to potential investors and enterprise users.

**Context**: VidyaFund AI is an education funding platform that connects students needing financial assistance with funders willing to support them. The platform uses AI for verification, matching, and impact tracking. While the backend functionality is solid, the frontend requires comprehensive UI/UX improvements to match the sophistication of the underlying technology.

**Scope**: This refactoring is strictly limited to UI/UX improvements. No new features, widgets, analytics, charts, or backend modifications are included.

## Glossary

- **VidyaFund_System**: The complete education funding platform including frontend and backend
- **Frontend_Application**: The React-based user interface being refactored
- **Student**: A user role requesting educational funding assistance
- **Funder**: A user role providing financial support to students
- **Admin**: A user role managing verification and oversight
- **Request**: A funding request submitted by a student
- **Status_Badge**: A visual indicator displaying the current state of a request
- **Design_System**: The collection of reusable components, styles, and patterns
- **KPI_Card**: A card component displaying key performance indicators (StatCard)
- **Request_Card**: A card component displaying student funding request details
- **Progress_Timeline**: A visual component showing request status progression
- **API_Integration**: The interface between frontend and backend services
- **Verification_Score**: An AI-generated score indicating request legitimacy
- **Match_Percentage**: An AI-calculated compatibility score between funder and request

## Requirements

### Requirement 1: Professional Visual Design

**User Story:** As a potential investor or enterprise user, I want the platform to convey trust and professionalism through its visual design, so that I feel confident in the platform's legitimacy and sophistication.

#### Acceptance Criteria

1. THE Frontend_Application SHALL use generous whitespace with consistent spacing from the approved scale (gap-3, gap-6, gap-8, p-4, p-6, p-8)
2. THE Frontend_Application SHALL minimize border usage and use shadows (shadow-sm, shadow-md) for component separation instead of heavy borders
3. THE Frontend_Application SHALL maintain consistent typography hierarchy using Inter font with sizes (text-3xl for page titles, text-xl for sections, text-base for cards, text-sm for body)
4. THE Frontend_Application SHALL use rounded corners (rounded-xl) for all card components
5. THE Frontend_Application SHALL apply colors sparingly and only for semantic meaning (status, actions, errors)
6. THE Frontend_Application SHALL never use gradients or multiple colors on the same element

### Requirement 2: Consistent Design System

**User Story:** As a developer maintaining the platform, I want a consistent design system with reusable components, so that I can build new features efficiently and maintain visual consistency.

#### Acceptance Criteria

1. THE Design_System SHALL define a typography scale with exactly 6 levels (pageTitle, sectionTitle, cardTitle, bodyText, metadata, caption)
2. THE Design_System SHALL define a spacing scale with exactly 3 levels (tight, default, relaxed)
3. THE Design_System SHALL define a semantic color system for primary, success, warning, danger, AI, and neutral intents
4. THE Design_System SHALL provide a Card component with base, hover, and interactive variants
5. THE Design_System SHALL provide a Button component with primary, secondary, ghost, and danger variants
6. THE Design_System SHALL provide StatCard, RequestCard, and ProgressTimeline reusable components
7. WHEN developers use Design_System components, THEN they SHALL NOT need to write custom CSS or Tailwind classes for common patterns

### Requirement 3: Status Visualization

**User Story:** As a user of any role, I want to instantly understand the status of funding requests through clear visual indicators, so that I can quickly assess progress without reading detailed text.

#### Acceptance Criteria

1. THE Frontend_Application SHALL display status badges using exactly these color mappings: submitted=amber, verified=indigo, matched=blue, approved=violet, disbursed=emerald, completed=emerald, rejected=red
2. WHEN displaying a request status, THE Status_Badge SHALL include both color background and border with text using the same color family
3. THE Progress_Timeline SHALL display exactly 5 steps (Submitted, Verified, Matched, Approved, Funded) with visual indicators for completed, current, and pending states
4. WHEN a step is completed, THE Progress_Timeline SHALL display it with blue color (bg-blue-600, text-blue-600)
5. WHEN a step is current, THE Progress_Timeline SHALL display it with a ring indicator (ring-2 ring-blue-200)
6. WHEN a step is pending, THE Progress_Timeline SHALL display it with gray color (bg-white border-gray-300, text-gray-400)

### Requirement 4: Role-Based Dashboard Experience

**User Story:** As a user logging into the platform, I want to see a dashboard tailored to my specific role and responsibilities, so that I can efficiently complete my tasks without navigating through irrelevant features.

#### Acceptance Criteria

1. WHEN a Student user accesses their dashboard, THE Frontend_Application SHALL display exactly 3 KPI cards (Active Requests, Funded Requests, Total Received)
2. WHEN a Funder user accesses their dashboard, THE Frontend_Application SHALL display exactly 3 KPI cards (Requests Waiting, Students Helped, Total Disbursed)
3. WHEN an Admin user accesses their dashboard, THE Frontend_Application SHALL display exactly 4 KPI cards (Total Requests, Pending Review, High Risk Flags, Total Disbursed)
4. THE Frontend_Application SHALL render each KPI_Card with an icon, label, and value in consistent format
5. THE Frontend_Application SHALL calculate dashboard statistics from the request data without additional API calls
6. WHEN displaying request lists, THE Frontend_Application SHALL use Request_Card format for students and funders, and table format for admins

### Requirement 5: Simplified Navigation

**User Story:** As a user navigating the application, I want a clean, uncluttered interface with minimal navigation chrome, so that I can focus on content without distraction.

#### Acceptance Criteria

1. THE Frontend_Application SHALL remove the sidebar navigation component from all pages
2. THE Frontend_Application SHALL provide a topbar navigation with exactly these elements: Logo, Page Context, User Avatar, Logout Button
3. THE Topbar SHALL have height h-14, white background, and bottom border (border-b)
4. THE Topbar SHALL remain sticky at top of viewport (sticky top-0) during scrolling
5. THE Frontend_Application SHALL use max-width constraints (max-w-5xl or max-w-6xl) for content areas with horizontal padding (px-6)

### Requirement 6: Two-Column Login Experience

**User Story:** As a new user arriving at the login page, I want to understand the platform's value proposition and mission while also being able to quickly authenticate, so that I can make an informed decision about using the platform.

#### Acceptance Criteria

1. THE Login_Page SHALL display a two-column layout with left column for value proposition and right column for authentication form
2. THE left column SHALL display platform logo, headline ("Fund Education. Create Opportunities."), description (2-3 sentences), and 3 platform statistics
3. THE 3 platform statistics SHALL be "1200+ Students Supported", "₹2.4 Crore Distributed", and "95% Verification Accuracy"
4. THE right column SHALL contain a login card (max-w-md) with email, password, role selector, and sign-in button
5. THE Login_Page SHALL provide collapsible demo credentials section that is collapsed by default
6. WHEN a user clicks "Use demo credentials", THE Frontend_Application SHALL expand the section to show 3 role options
7. WHEN a user clicks a demo role option, THE Frontend_Application SHALL auto-fill credentials and execute login

### Requirement 7: Student Request Card Display

**User Story:** As a student viewing my funding requests, I want to see each request in a scannable card format with all key information visible, so that I can quickly find and review specific requests without clicking through details.

#### Acceptance Criteria

1. THE Frontend_Application SHALL display student requests as Request_Card components instead of table rows
2. THE Request_Card SHALL display category, status badge, amount, description (line-clamp-2), deadline, and verification score in a single card
3. THE Request_Card SHALL embed a Progress_Timeline showing the 5-step request lifecycle
4. THE Request_Card SHALL have padding p-6, rounded corners rounded-xl, and shadow shadow-sm
5. WHEN a user hovers over a Request_Card, THE card SHALL display hover effects (border-blue-300, shadow-md)
6. WHEN a user clicks a Request_Card, THE Frontend_Application SHALL navigate to the status tracker page for that request

### Requirement 8: Admin Request Pipeline Management

**User Story:** As an admin managing the verification pipeline, I want to see all requests in a sortable, searchable table with expandable details and quick actions, so that I can efficiently review and verify multiple requests.

#### Acceptance Criteria

1. THE Admin_Dashboard SHALL display requests in a modern table with columns: Category, Amount, AI Score, Status, Actions
2. THE Admin_Dashboard SHALL provide a search input that filters requests by description or category
3. WHEN an admin enters search text, THE Frontend_Application SHALL filter the table using case-insensitive partial matching on description and category fields
4. THE Admin_Dashboard SHALL allow expanding individual rows to show full request details
5. WHEN an admin clicks a "Verify" action button, THE Frontend_Application SHALL call the verification API and display the resulting verification score
6. THE Admin_Dashboard SHALL display only one expanded row at a time
7. THE Admin_Dashboard SHALL NOT display any charts or visualizations beyond the 4 KPI cards

### Requirement 9: Funder Discovery Feed

**User Story:** As a funder looking to support students, I want to browse verified funding requests with clear information about each request's legitimacy and match quality, so that I can make informed decisions about which students to support.

#### Acceptance Criteria

1. THE Funder_Dashboard SHALL provide two tabs: "Discovery Feed" and "My Contributions"
2. THE Discovery_Feed tab SHALL display only requests with status verified, matched, or approved
3. THE My_Contributions tab SHALL display only requests with status disbursed or completed
4. THE Discovery_Feed SHALL display each request as a Request_Card with category badge, description, amount, AI verification signals, and "Disburse Funds" button
5. THE AI verification signals SHALL include "AI Verified" indicator, Verification_Score, and Match_Percentage
6. WHEN a funder clicks "Disburse Funds", THE Frontend_Application SHALL call the match API, then the disburse API, then mock verify payment
7. WHEN disbursement succeeds, THE Frontend_Application SHALL show success toast and move the request to the "My Contributions" tab
8. THE Funder_Dashboard SHALL NOT display any charts or visualizations beyond the 3 KPI cards

### Requirement 10: Multi-Step Request Form

**User Story:** As a student submitting a funding request, I want a guided multi-step form with clear validation and progress indication, so that I can provide all required information without feeling overwhelmed.

#### Acceptance Criteria

1. THE Request_Form SHALL provide exactly 4 steps: Basic Information, Amount & Deadline, Document Upload, Review
2. THE Request_Form SHALL validate Step 1 requiring title length > 3, category selected, and description length >= 10
3. THE Request_Form SHALL validate Step 2 requiring amount >= 2000 and deadline_date provided
4. THE Request_Form SHALL make Step 3 (Document Upload) optional with no validation required
5. THE Request_Form SHALL make Step 4 (Review) a confirmation step with no validation
6. THE Request_Form SHALL disable the "Continue" button when current step validation fails
7. WHEN a student completes all steps and submits, THE Frontend_Application SHALL send multipart form data to the API including all fields
8. WHEN submission succeeds, THE Frontend_Application SHALL navigate to the status tracker page for the created request

### Requirement 11: Consistent Interactive Feedback

**User Story:** As a user interacting with the application, I want immediate visual feedback for my actions (hovers, clicks, loading states), so that I know the system is responding to my input.

#### Acceptance Criteria

1. WHEN a user hovers over a clickable card, THE card SHALL display hover effects (border color change, shadow increase) with transition duration 200ms
2. WHEN a button is in loading state, THE button SHALL display opacity-50 and cursor-not-allowed
3. WHEN a button is in loading state, THE button text SHALL change to indicate progress (e.g., "Submitting..." instead of "Submit")
4. THE Frontend_Application SHALL use Framer Motion for page transitions and card entrance animations
5. WHEN animating multiple items in a list, THE Frontend_Application SHALL stagger animations with 60ms delay between items
6. THE Frontend_Application SHALL respect user preference for reduced motion (prefers-reduced-motion)

### Requirement 12: Error Handling and Empty States

**User Story:** As a user experiencing errors or viewing empty data, I want clear, friendly messages that explain what happened and suggest next actions, so that I don't feel frustrated or confused.

#### Acceptance Criteria

1. WHEN an API request fails, THE Frontend_Application SHALL display an error toast notification with the error message or generic fallback
2. WHEN form validation fails, THE Frontend_Application SHALL display inline error messages for each invalid field
3. WHEN a user's authentication token expires, THE Frontend_Application SHALL clear the token, show "Session expired" toast, and redirect to login
4. WHEN a dashboard has no data to display, THE Frontend_Application SHALL show an empty state component with icon, message, description, and call-to-action button
5. THE empty state component SHALL use gray tones and friendly copy (not error styling)
6. WHEN a file upload fails validation, THE Frontend_Application SHALL display specific error message ("File size exceeds 10MB" or "Invalid file type")
7. THE Frontend_Application SHALL preserve form data during validation errors to allow user retry without re-entering

### Requirement 13: Responsive Layout Adaptation

**User Story:** As a user accessing the platform on different devices, I want the interface to adapt appropriately to my screen size, so that I can use all features regardless of device.

#### Acceptance Criteria

1. THE Frontend_Application SHALL use TailwindCSS responsive breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
2. WHEN viewport is mobile (< 640px), THE KPI_Card grid SHALL display 1 column
3. WHEN viewport is tablet (640px - 1024px), THE KPI_Card grid SHALL display 2 columns
4. WHEN viewport is desktop (>= 1024px), THE KPI_Card grid SHALL display 3-4 columns depending on role
5. THE Login_Page SHALL switch from two-column to single-column layout when viewport is below 768px
6. THE Admin_Dashboard table SHALL remain horizontally scrollable on mobile devices
7. THE Frontend_Application SHALL maintain readable text sizes and touch-friendly button sizes (min h-12) across all breakpoints

### Requirement 14: Accessibility Standards

**User Story:** As a user with accessibility needs, I want the platform to be navigable via keyboard and compatible with screen readers, so that I can use all features independently.

#### Acceptance Criteria

1. THE Frontend_Application SHALL provide visible focus indicators (focus:ring-2 focus:ring-blue-500) for all interactive elements
2. THE Frontend_Application SHALL support complete keyboard navigation using Tab, Enter, and Escape keys
3. THE Frontend_Application SHALL provide appropriate ARIA labels for icon-only buttons
4. THE Button components SHALL include proper type attributes (button, submit) to prevent unintended form submissions
5. THE Status_Badge components SHALL include text content, not rely solely on color for meaning
6. THE Frontend_Application SHALL maintain color contrast ratios of at least 4.5:1 for normal text and 3:1 for large text
7. WHEN using modals or dialogs, THE Frontend_Application SHALL trap focus within the modal and restore focus on close

### Requirement 15: Performance Optimization

**User Story:** As a user interacting with the platform, I want pages to load quickly and interactions to feel responsive, so that I can complete my tasks efficiently without waiting.

#### Acceptance Criteria

1. THE Frontend_Application SHALL implement memoization (React.memo) for StatCard and RequestCard components
2. WHEN displaying lists with more than 50 items, THE Frontend_Application SHALL implement virtualization or pagination
3. THE Frontend_Application SHALL debounce search input with 300ms delay to reduce filter operations
4. THE Frontend_Application SHALL code-split route components using React.lazy() and Suspense
5. THE Frontend_Application SHALL configure React Query with staleTime of 60 seconds and cacheTime of 5 minutes
6. THE Frontend_Application SHALL tree-shake Lucide icons by importing only used icons
7. THE Frontend_Application SHALL limit animation duration to 200-300ms and use GPU-accelerated transforms

### Requirement 16: No Feature Addition Constraint

**User Story:** As a product manager, I want this refactoring to strictly improve UI/UX without adding new features, so that we maintain project scope and avoid introducing new bugs or complexity.

#### Acceptance Criteria

1. THE Frontend_Application SHALL preserve all existing API endpoints and request/response structures
2. THE Frontend_Application SHALL NOT add new pages, modals, or navigation destinations beyond existing routes
3. THE Frontend_Application SHALL NOT add new analytics dashboards, charts, widgets, or data visualizations
4. THE Frontend_Application SHALL NOT add new user actions or workflows beyond existing capabilities
5. THE Frontend_Application SHALL NOT modify backend logic, database schema, or API contracts
6. THE Frontend_Application SHALL preserve all existing user permissions and role-based access controls
7. WHEN comparing feature lists between old and new implementations, THE sets SHALL be identical

### Requirement 17: API Integration Preservation

**User Story:** As a backend developer, I want the frontend refactoring to maintain all existing API contracts, so that I don't need to make any backend changes or risk breaking integrations.

#### Acceptance Criteria

1. THE Frontend_Application SHALL use the same API endpoints as the current implementation
2. THE Frontend_Application SHALL send request payloads with identical structure and field names
3. THE Frontend_Application SHALL handle response data with the same parsing and transformation logic
4. THE Frontend_Application SHALL maintain the same authentication mechanism (JWT token in localStorage)
5. THE Frontend_Application SHALL preserve React Query cache keys and query functions
6. WHEN comparing API call logs between old and new implementations, THE request structures SHALL be identical

### Requirement 18: Visual Consistency Across Pages

**User Story:** As a user navigating between different pages, I want the visual design to feel cohesive and consistent, so that I can learn the interface patterns once and apply them everywhere.

#### Acceptance Criteria

1. THE Frontend_Application SHALL use the same Topbar component with identical styling on all authenticated pages
2. THE Frontend_Application SHALL use the same KPI_Card component for statistics across all dashboards
3. THE Frontend_Application SHALL use the same Button component variants across all pages
4. THE Frontend_Application SHALL apply the same content max-width and padding (max-w-5xl or max-w-6xl, px-6, py-8) on all pages
5. THE Frontend_Application SHALL use the same toast notification styling (react-hot-toast) for all success, error, and info messages
6. THE Frontend_Application SHALL use the same empty state component pattern across all pages with no data
7. THE Frontend_Application SHALL use the same loading spinner or skeleton patterns across all pages during data fetching

### Requirement 19: Input Validation and Security

**User Story:** As a security-conscious user, I want the platform to validate and sanitize all inputs, so that I can trust the platform handles data safely and prevents malicious content.

#### Acceptance Criteria

1. THE Frontend_Application SHALL validate email format before allowing login submission
2. THE Frontend_Application SHALL validate amount field to accept only integers between 2000 and 10000000
3. THE Frontend_Application SHALL validate file uploads to accept only PDF, PNG, and JPG files under 10MB
4. THE Frontend_Application SHALL escape all user-generated text content automatically via React's JSX (no dangerouslySetInnerHTML with user content)
5. THE Frontend_Application SHALL never store sensitive data (passwords, tokens) in browser state beyond localStorage for JWT
6. THE Frontend_Application SHALL clear authentication token from localStorage on logout
7. WHEN a 401 Unauthorized response is received, THE Frontend_Application SHALL automatically clear authentication and redirect to login

### Requirement 20: Toast Notification System

**User Story:** As a user performing actions in the platform, I want non-intrusive notifications for success, error, and informational feedback, so that I can stay informed without being interrupted.

#### Acceptance Criteria

1. THE Frontend_Application SHALL display toast notifications using react-hot-toast library
2. WHEN an action succeeds, THE Frontend_Application SHALL display a success toast (green) for 5 seconds
3. WHEN an action fails, THE Frontend_Application SHALL display an error toast (red) for 5 seconds
4. THE toast notifications SHALL appear at top-center or bottom-center of viewport
5. THE toast notifications SHALL be dismissible by clicking or automatically after 5 seconds
6. THE Frontend_Application SHALL never display more than 3 toast notifications simultaneously
7. THE Frontend_Application SHALL display specific, actionable messages in toasts (not generic "Success" or "Error")
