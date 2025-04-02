# FreshLeap - Local Farmers' Marketplace

FreshLeap is a digital platform connecting consumers directly with local farmers, making it easy to browse and purchase fresh, locally-grown produce. The platform supports local agriculture while providing consumers with access to fresh, locally sourced food.

<img src="public/images/logobgr.png" alt="FreshLeap" width="75" height="auto">
<img src="https://img.enacton.com/ShareX/2025/04/chrome_1QvaAAm8J8.png" alt="FreshLeap" width="auto" height="auto">
<img src="https://img.enacton.com/ShareX/2025/04/chrome_k3ZlD6LZrx.png" alt="FreshLeap" width="auto" height="auto">
<img src="https://img.enacton.com/ShareX/2025/04/chrome_VUrGJXdXxj.png" alt="FreshLeap" width="auto" height="auto">
<img src="https://img.enacton.com/ShareX/2025/04/chrome_yTtdt6e8EK.png" alt="FreshLeap" width="auto" height="auto">
<img src="https://img.enacton.com/ShareX/2025/04/chrome_xGgAGq0Crj.png" alt="FreshLeap" width="auto" height="auto">


## 🌱 Features

### For Customers
- **Browse Products**: Explore a wide range of fresh, locally-grown produce
- **Filter Options**: Find products by category (fruits, vegetables), location, or price range
- **Secure Checkout**: Stripe-powered payment system for seamless transactions
- **Order Tracking**: Monitor your orders from purchase to delivery
- **Product Reviews**: Read and leave reviews for products you've purchased

### For Farmers
- **Dashboard**: Manage products, track orders, and view sales analytics
- **Product Management**: Add, edit, and remove product listings
- **Order Fulfillment**: Process and update order status
- **Sales Analytics**: Visualize sales data with interactive charts

## 🚀 Tech Stack

## 🛠 Tech Stack
| Component              | Technology                                      |
|------------------------|-------------------------------------------------|
| **Frontend**           | Next.js 15, React 19, ShadCN UI, Tailwind CSS 4 |
| **Backend**            | Next.js API Routes                              |
| **Database**           | PostgreSQL with Drizzle ORM                     |
| **Authentication**     | NextAuth.js (JWT)                               |
| **Payment Processing** | Stripe                                          |
| **Email Services**     | Resend Transactional Email                      |
| **State Management**   | Zustand                                         |
| **UI Components**      | Radix UI, ShadCN/UI                             |
| **Validation**         | Zod Schema Validation                           |
| **CI/CD**              | Vercel Edge Network                             |
| **Visualization**      | Recharts                                        |

## 📋 Prerequisites

- Node.js 20+ 
- PNPM
- PostgreSQL database (or Neon serverless Postgres)
- Stripe account for payment processing
- Resend account for email services

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone https://github.com/Yash-Tibadiya/FreshLeap.git
cd freshleap
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Environment setup**

Copy the example environment file and update with your credentials:

```bash
cp .env.example .env
```

Configure the following environment variables:

```
# Database
DATABASE_URL=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend (for emails)
RESEND_API_KEY=
```

4. **Database setup**

```bash
# Generate the database schema
pnpm db:generate

# Run migrations
pnpm db:migrate
```

5. **Start the development server**

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## 🌐 Deployment

### Vercel One-Click Deployment
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Yash-Tibadiya/FreshLeap)

The application will be automatically configured and deployed on Vercel's global edge network.

## 🗄️ Project Structure

```
└── 📁freshleap
    └── 📁emails               # Email templates
    └── 📁public               # Static assets
    └── 📁src
        └── 📁app              # Next.js App Router
            └── 📁(app)        # Main application routes
            └── 📁(auth)       # Authentication routes
            └── 📁api          # API endpoints
        └── 📁components       # React components
            └── 📁dashboard    # Dashboard components
            └── 📁ui           # UI components (shadcn/ui)
        └── 📁context          # React context providers
        └── 📁db               # Database configuration
        └── 📁helpers          # Helper functions
        └── 📁hooks            # Custom React hooks
        └── 📁lib              # Utility libraries
        └── 📁store            # Zustand stores
        └── 📁types            # TypeScript type definitions
```

## 💻 Available Scripts

- `pnpm dev` - Start the development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm db:generate` - Generate Drizzle migrations
- `pnpm db:migrate` - Apply database migrations
- `pnpm db:studio` - Open Drizzle Studio for database management

## 🔗 API Routes

- `/api/auth/*` - Authentication endpoints (NextAuth.js)
- `/api/products/*` - Product management endpoints
- `/api/farmers/*` - Farmer profile endpoints
- `/api/cart/*` - Shopping cart endpoints
- `/api/checkout/*` - Checkout and payment endpoints
- `/api/orders/*` - Order management endpoints
- `/api/review/*` - Product review endpoints

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

## 📬 Contact

- Project Maintainer: Yash Tibadiya
- Email: tibadiyayash@gmail.com
- [GitHub Issues](https://github.com/Yash-Tibadiya/FreshLeap/issues)

## 🌟 Acknowledgements

- [Next.js](https://nextjs.org/) - React framework for production
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [ShadCN UI](https://ui.shadcn.com/) - Re-usable components built with Radix UI and Tailwind CSS
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM for SQL databases
- [Stripe](https://stripe.com/) - Payment processing platform
- [Resend](https://resend.com/) - Email API for developers
- [Vercel](https://vercel.com/) - Platform for frontend frameworks and static sites

---

Built with ❤️ by Yash Tibadiya