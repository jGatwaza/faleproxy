#!/bin/bash

# Script to create and switch to testfix branch for preview deployments

echo "🚀 Setting up testfix branch for preview deployments..."

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Fetch latest changes
echo "📥 Fetching latest changes..."
git fetch origin

# Check if testfix branch exists locally
if git show-ref --verify --quiet refs/heads/testfix; then
    echo "📋 testfix branch exists locally"
    git checkout testfix
    git pull origin main
else
    # Check if testfix branch exists remotely
    if git show-ref --verify --quiet refs/remotes/origin/testfix; then
        echo "📋 testfix branch exists remotely, checking out..."
        git checkout -b testfix origin/testfix
    else
        echo "🌟 Creating new testfix branch from main..."
        git checkout main
        git pull origin main
        git checkout -b testfix
    fi
fi

echo "✅ You're now on the testfix branch!"
echo ""
echo "📝 Next steps:"
echo "1. Make your changes"
echo "2. Commit and push: git push origin testfix"
echo "3. Your preview will be deployed automatically!"
echo "4. Check the GitHub Actions tab for the preview URL"
echo ""
echo "🔄 To sync with main later: git pull origin main"
