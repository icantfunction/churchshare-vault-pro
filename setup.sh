
#!/usr/bin/env sh

echo "🚀 Setting up ChurchShare development environment..."

# Install dependencies
echo "📦 Installing npm dependencies..."
if ! npm install; then
  echo "❌ Failed to install dependencies"
  exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
  echo "⚠️  No .env file found. Please create one based on .env.example"
  echo "📋 You can copy .env.example to .env and fill in your Supabase credentials:"
  echo "   cp .env.example .env"
  echo ""
  echo "🔑 Get your Supabase credentials from: https://app.supabase.com/project/YOUR_PROJECT/settings/api"
else
  echo "✅ .env file already exists"
fi

# Run linting
echo "🔍 Running linting..."
if ! npm run lint; then
  echo "❌ Linting failed. Please fix the issues above."
  exit 1
fi

# Run build
echo "🏗️  Running build..."
if ! npm run build; then
  echo "❌ Build failed. Please fix the issues above."
  exit 1
fi

echo ""
echo "🎉 Setup complete! You can now run:"
echo "   npm run dev    # Start development server"
echo "   npm run build  # Build for production"
echo "   npm run lint   # Run linting"
echo ""
echo "📖 For more information, check the README.md file"
