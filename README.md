# NextFlix 🎬

A personal movie and TV series tracking application built with React and Vite. Track your watched content, rate what you've seen, and discover new movies and series with a Netflix-inspired interface.

## ✨ Features

### 🔍 Search & Discovery
- **Modern Search Popup**: Click-to-activate search with full-screen popup overlay
- **TMDB Integration**: Real movie/series data from The Movie Database API
- **Glass Morphism UI**: Beautiful blurred popup with backdrop effects
- **Smart Debouncing**: 500ms delay for optimal search performance
- **Background Lock**: Prevents scrolling while popup is active
- **Sticky Header**: Search controls remain accessible while browsing results

### ⭐ Rating System
- **Three-Tier Rating**: Love This! (Award icon), I Like It (Thumbs Up), Not For Me (Thumbs Down)
- **Outline Icons**: Consistent outline styling using Lucide React icons
- **Quick Rating**: Rate directly from search results or your collection
- **Visual Indicators**: Rating badges on all movie/series cards

### 📚 Collection Management
- **Personal Library**: All your rated content stored locally
- **Advanced Filtering**: Filter by type (Movies/Series), rating (Love/Like/Dislike), or view all
- **Multiple Sort Options**: 
  - Recently Watched (default)
  - By Title (A-Z)
  - By Year (Latest first)
  - By Rating (Best TMDB ratings first)
- **Smart Reset**: Separate reset buttons for search and collection filters

### 🎨 User Interface
- **Netflix-Style Design**: Dark theme with red accents and premium styling
- **Modern Header Layout**: Left-aligned logo, search field, and right-aligned stats
- **Glass Morphism Effects**: Blurred backgrounds with subtle transparency
- **Responsive Layout**: Seamless experience across mobile, tablet, and desktop
- **Custom Dropdowns**: Styled dropdowns with custom arrows and proper spacing
- **Smooth Animations**: Hover effects and transitions throughout
- **High-Resolution Images**: w1280 quality images in detail modals
- **Visual Hierarchy**: Clean spacing and subtle border separations

### 💾 Data Persistence
- **LocalStorage**: All ratings and data persist between sessions
- **Automatic Sync**: Changes saved immediately
- **Data Recovery**: Reliable data loading with fallback handling

### 📊 Header Statistics
Integrated stats in the top navigation showing:
- **Total**: Complete count of watched items
- **Movies**: Movie count with white styling
- **Series**: TV series count with white styling  
- **Love**: Purple-colored count of loved content
- **Like**: Green-colored count of liked content
- **Dislike**: Red-colored count of disliked content

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1
- **Build Tool**: Vite 7.1.2
- **Styling**: Tailwind CSS 4.1.12
- **Icons**: Lucide React 0.542.0
- **Code Quality**: ESLint with React plugins

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/baliomega/nextflix.git
   cd nextflix
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up TMDB API (Required for real data)**
   - Get an API key from [The Movie Database](https://www.themoviedb.org/settings/api)
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your API key to `.env`:
     ```
     VITE_TMDB_API_KEY=your_actual_api_key_here
     ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5173/nextflix/`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🎯 Usage

### Adding Movies/Series
1. Click the search field in the header to open the search popup
2. Type in the popup search field to find movies or TV series
3. Browse results in the beautiful glass morphism popup
4. Click on any result to view detailed information
5. Rate the content using the three rating options
6. Your rated content automatically appears in "Your Collection"

### Managing Your Collection
- **Filter**: Use the dropdown filters to narrow down your collection
- **Sort**: Choose how you want your collection organized
- **Reset**: Use the reset button to clear all collection filters

### Rating System
- **🏆 Love This!** - Your absolute favorites
- **👍 I Like It** - Content you enjoyed
- **👎 Not For Me** - Content that wasn't your taste

## 🔧 Configuration

### TMDB API (Required)
The app requires a TMDB API key to fetch real movie/TV data:

1. **Get API Key**: Register at [The Movie Database](https://www.themoviedb.org/settings/api)
2. **Configure**: Add your key to the `.env` file:
   ```
   VITE_TMDB_API_KEY=your_actual_api_key_here
   ```
3. **Restart**: Restart the development server to apply changes

**Note**: Without a valid API key, the app will use fallback mock data.

### Data Storage
- Data is stored in browser's localStorage under the key `nextflix-data`
- No external database required - everything runs client-side

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📱 Responsive Design

NextFlix is fully responsive and optimized for:
- 📱 **Mobile**: Single column layout with touch-friendly interactions
- 📟 **Tablet**: Multi-column grid with balanced spacing
- 🖥️ **Desktop**: Full grid layout with hover effects
- 🖥️ **Large Desktop**: Edge-to-edge design with proper content centering

## 🎨 Design System

### Layout
- **Header**: Modern three-section layout (Logo | Search | Stats)
- **Spacing**: Generous padding and margins throughout
- **Borders**: Subtle 20% opacity white separators
- **Glass Morphism**: Blurred backgrounds with backdrop filters

### Colors
- **Primary**: Netflix Red (`#dc2626`)
- **Background**: Pure Black (`#000000`)
- **Glass Elements**: Translucent black with blur effects
- **Stats Colors**: Purple (Love), Green (Like), Red (Dislike)
- **Text**: White and Gray variants with proper contrast

### Typography
- **Logo**: Large, bold Netflix-style branding
- **Headers**: Clean hierarchy with proper spacing
- **Interactive**: Consistent sizing and spacing
- **Stats**: Compact, readable number display

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: Netflix UI/UX
- **Icons**: [Lucide React](https://lucide.dev/)
- **Movie Data**: [The Movie Database (TMDB)](https://www.themoviedb.org/)
- **Built with**: [Vite](https://vitejs.dev/) and [React](https://reactjs.org/)

---

**Made with ❤️ and lots of ☕**

For questions or support, please open an issue on GitHub.