#!/bin/bash

echo "🚀 Setting up Project Management Database..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update DATABASE_URL and JWT_SECRET before continuing."
    exit 1
fi

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate dev --name init

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure your .env file has the correct DATABASE_URL and JWT_SECRET"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3000 to see your app"

