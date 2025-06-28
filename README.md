
# ChurchShare

A secure, simple file sharing platform designed specifically for churches and creative ministries. Built with React, TypeScript, and Supabase.

## Features

- **Secure File Sharing**: Role-based permissions ensure only authorized ministry members can access files
- **High-Quality Uploads**: Upload photos and files without compression - original quality preserved
- **Ministry Organization**: Organize files by ministry and events for easy discovery
- **Demo Mode**: Try the platform with sample data before signing up

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

### Quick Setup

1. **Clone and setup the project:**
   ```bash
   git clone <repository-url>
   cd churchshare
   ./setup.sh  # One-click setup script
   ```

2. **Configure environment variables (MANDATORY):**
   ```bash
   cp .env.example .env
   ```
   
   **⚠️ IMPORTANT**: You MUST edit `.env` and add your Supabase credentials before running the app:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
   
   **The app will not start without these environment variables configured.**

3. **Start development server:**
   ```bash
   npm run dev
   ```

### Environment Variables

This project requires Supabase credentials to function properly. You'll need to:

1. **Create a Supabase project** at [https://app.supabase.com](https://app.supabase.com)

2. **Get your credentials** from Project Settings → API:
   - `Project URL` → use as `VITE_SUPABASE_URL`
   - `anon public` key → use as `VITE_SUPABASE_ANON_KEY`

3. **Create your .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Add your credentials to .env:**
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

⚠️ **Security Note**: Never commit your `.env` file to version control. The `.env.example` file is provided as a template.

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Routing**: React Router
- **State Management**: React Context API
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── pages/              # Route components
└── lib/                # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Run linting: `npm run lint`
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the MIT License.
