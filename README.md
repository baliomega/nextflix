# NextFlix 🎬

A personal movie and TV series tracking application built with React and Vite. Track your watched content, rate what you've seen, and discover new movies and series with a Netflix-inspired interface.

![NextFlix Screenshot](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=NextFlix)

## ✨ Features

### 🔍 Search & Discovery
- **Smart Search**: Search for movies and TV series with debounced input (500ms delay)
- **Mock TMDB Integration**: Demo data with realistic movie/series information
- **Responsive Results**: Grid layout that adapts to all screen sizes
- **Conditional Clear**: Clear button appears only when needed

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
- **Netflix-Style Design**: Dark theme with red accents
- **Responsive Layout**: Works seamlessly on mobile, tablet, and desktop
- **Centered Search**: Clean header with centered search field
- **Custom Dropdowns**: Styled dropdowns with custom arrows and proper spacing
- **Hover Effects**: Smooth transitions and interactive elements
- **High-Resolution Images**: w1280 quality images in detail modals

### 💾 Data Persistence
- **LocalStorage**: All ratings and data persist between sessions
- **Automatic Sync**: Changes saved immediately
- **Data Recovery**: Reliable data loading with fallback handling

### 📊 Statistics Dashboard
Real-time stats showing:
- Total watched items
- Movies vs TV series breakdown
- Rating distribution (Love/Like/Dislike counts)

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

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🎯 Usage

### Adding Movies/Series
1. Use the search bar to find movies or TV series
2. Click on any search result to view details
3. Rate the content using the three rating options
4. Your rated content automatically appears in "Your Collection"

### Managing Your Collection
- **Filter**: Use the dropdown filters to narrow down your collection
- **Sort**: Choose how you want your collection organized
- **Reset**: Use the reset button to clear all collection filters

### Rating System
- **🏆 Love This!** - Your absolute favorites
- **👍 I Like It** - Content you enjoyed
- **👎 Not For Me** - Content that wasn't your taste

## 🔧 Configuration

### TMDB API (Optional)
To use real TMDB data instead of mock data:

1. Get an API key from [The Movie Database](https://www.themoviedb.org/settings/api)
2. Create a `.env.local` file:
   ```
   VITE_TMDB_API_KEY=your_api_key_here
   ```
3. Restart the development server

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

### Colors
- **Primary**: Netflix Red (`#dc2626`)
- **Background**: Pure Black (`#000000`)
- **Cards**: Dark Gray (`#1f2937`)
- **Text**: White and Gray variants

### Typography
- **Headings**: Bold, high contrast
- **Body**: Clean, readable sans-serif
- **Interactive**: Consistent sizing and spacing

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