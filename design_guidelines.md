# CuidarBem - Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - This is a marketplace connecting multiple user types with backend integration.

**Implementation:**
- Email/password authentication for all 4 user types (cuidadores, enfermeiros, contratantes, empresas)
- Role selection during signup to determine user type
- Login screen must display the CuidarBem logo at top
- Include "Cuidados com Carinho" tagline below logo
- Include privacy policy & terms of service links (with LGPD compliance disclaimer)
- Account screen features:
  - Profile settings
  - Subscription status display
  - Payment history
  - Log out (with confirmation)
  - Delete account (Settings > Account > Delete with double confirmation)

### Navigation
**Tab Navigation** (4 tabs):
1. **Buscar** (Search) - Search for caregivers/nurses
2. **Chat** - Real-time messaging
3. **Perfil** (Profile) - User profile and settings
4. **Cuidados** (Care) - Patient care management (only for contratantes)

**Note:** Empresas (companies) have simplified navigation: Perfil and Chat only.

### Screen Specifications

#### 1. Onboarding/Splash
- Full-screen CuidarBem logo centered
- "Cuidados com Carinho" tagline below
- Subtitle: "Conectamos famílias a cuidadores e enfermeiros qualificados para proporcionar o melhor cuidado aos seus entes queridos"
- Background: #FFFAC7

#### 2. Login/Signup
- Logo at top (centered, 120px height)
- Form fields on #FFFAC7 background
- Input fields with subtle borders (#000000, 1px)
- Primary action buttons: #00FCE3 background, #000000 text
- "Esqueci minha senha" link in #000AFF
- Role selection uses pill-style toggles with #00FCE3 for selected state

#### 3. Buscar (Search) Screen
- **Header:** Transparent with search bar, filter button (right)
- **Layout:** Scrollable list of profile cards
- **Top inset:** headerHeight + Spacing.xl
- **Bottom inset:** tabBarHeight + Spacing.xl
- **Profile Cards:**
  - Photo (circular, 80px)
  - Name, role badge, city, availability
  - Star rating display (gold stars)
  - Price per hour/day/month
  - Card background: White with subtle border
  - Tap card to view full profile
- **Filter Modal:** City, availability type (hora/dia/semana/mês), role type

#### 4. Chat Screen
- **Header:** Default with title "Conversas"
- **Layout:** Scrollable list of conversation items
- **Conversation Items:**
  - Avatar (50px circular)
  - Name, role badge
  - Last message preview
  - Timestamp
  - Unread indicator: #DC4429 dot
- **Chat Detail Screen:**
  - Header shows recipient name and role badge
  - Message bubbles: Sent (#00FCE3 bg, #000000 text), Received (white bg, #000000 text)
  - Input bar at bottom with #00FCE3 send button

#### 5. Perfil (Profile) Screen
- **Header:** Transparent
- **Top inset:** headerHeight + Spacing.xl
- **Layout:** Scrollable form
- **Sections:**
  - Photo upload (circular, 120px, centered)
  - Role indicator badge prominently displayed
  - Form fields for personal data
  - Subscription status card (green if active, #DC4429 if expired)
  - For cuidadores/enfermeiros: Service pricing section
  - Availability toggle switches (#00FCE3 when active)
  - Ratings received (star display)
  - Save button: #00FCE3 background, full-width at bottom

#### 6. Cuidados (Care Management) - Contratantes only
- **Header:** Default with "+ Adicionar" button (right)
- **Layout:** Scrollable cards for each category
- **Categories:**
  - Remédios (medications) - #000AFF accent
  - Refeições (meals) - #00FCE3 accent
  - Consultas (appointments) - #DC4429 accent
  - Exercícios (exercises) - #000AFF accent
- **Cards:** White background, category color left border (4px)
- **Add/Edit forms:** Modal with header buttons (Cancel/Save)

#### 7. Subscription/Payment Screens
- Payment status banner at top of profile when near expiration (#DC4429 background)
- Subscription plans screen: Cards for monthly/annual with #00FCE3 "Assinar" buttons
- Payment history: List with date, amount, status indicator

## Design System

### Color Palette (MANDATORY)
- **Background:** #FFFAC7 (cream/light yellow) - use for all screen backgrounds
- **Text:** #000000 (black) - primary text color
- **Primary (Buttons/Header):** #00FCE3 (cyan) - all action buttons and header backgrounds
- **Button Text:** #000000 (black)
- **Accent 1:** #000AFF (blue) - links, secondary highlights
- **Accent 2:** #DC4429 (red) - alerts, warnings, important notifications
- **White:** #FFFFFF - card backgrounds, message bubbles

### Typography
- **Headers:** SF Pro Display (iOS) / Roboto (Android), Bold, 24-28px
- **Body:** SF Pro Text (iOS) / Roboto (Android), Regular, 16px
- **Captions:** 14px, color #666666
- **Role Badges:** 12px, Bold, uppercase

### Visual Design
- **Icons:** Use Feather icons from @expo/vector-icons in #000000
- **Role Badges:** Pill-shaped, 6px border-radius, role-specific background colors:
  - Cuidador: #00FCE3
  - Enfermeiro: #000AFF
  - Contratante: #DC4429
  - Empresa: #666666
- **Cards:** White background, 12px border-radius, subtle 1px border #E0E0E0
- **Floating Action Buttons:** #00FCE3 background with shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)
- **Avatar Placeholders:** Generate 4 preset avatars with warm, caring aesthetic (hands, hearts, care symbols) in app colors
- **Star Ratings:** Gold (#FFD700) filled stars, #E0E0E0 empty stars

### Interaction Design
- All buttons have press feedback: reduce opacity to 0.7
- #00FCE3 buttons darken slightly on press
- Form inputs highlight with #00FCE3 border when focused
- Tab bar icons use #00FCE3 for active tab, #666666 for inactive
- Swipe actions on chat conversations: archive (left), delete (right)

### Accessibility
- Minimum touch targets: 44x44px
- High contrast maintained between #000000 text and #FFFAC7 background
- Form labels always visible above inputs
- Error messages in #DC4429 with clear error icons
- Loading states use #00FCE3 activity indicators
- Alert dialogs for critical actions (delete account, subscription expiration)

### Assets Required
- CuidarBem logo (provided by user - hands protecting heart)
- 4 preset avatars for user profile customization (caring/medical theme)
- Star icon for ratings
- Role badges with text labels (Cuidador, Enfermeiro, Contratante, Empresa)