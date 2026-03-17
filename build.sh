#!/bin/bash

# Build script for Vercel deployment
# This script builds the React frontend and collects static files for Django.

set -e  # Exit on error

echo "📦 Collecting static files..."
python manage.py collectstatic --noinput

echo "✅ Static files collected!"
