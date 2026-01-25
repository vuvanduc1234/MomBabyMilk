# MomBabyMilk - Client Application

The frontend client for the MomBabyMilk e-commerce platform, built with React and Vite.

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **React Router** - Client-side routing

## Project Structure

```
src/
├── assets/          # Static assets (images, icons)
├── components/      # Reusable UI components
│   ├── layouts/     # Layout components (Header, Footer, Sidebar)
│   ├── products/    # Product-specific components
│   └── ui/          # shadcn/ui components
├── context/         # React Context providers
├── lib/             # Utility functions
└── pages/           # Page components
    ├── Cart/        # Shopping cart page
    ├── Checkout/    # Checkout page
    └── Products/    # Product listing and detail pages
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features

- Product browsing with filtering and search
- Shopping cart functionality
- Product detail views
- Responsive design with Tailwind CSS
- Custom UI components with shadcn/ui
- Sakura falling animation effect

## Configuration

- **Vite Config**: `vite.config.js`
- **Tailwind Config**: `tailwind.config.js`
- **ESLint Config**: `eslint.config.js`
- **PostCSS Config**: `postcss.config.js`

## Environment Variables

Create a `.env` file in the client directory with the following variables:

```env
VITE_API_URL=http://localhost:3000/api
```

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.
