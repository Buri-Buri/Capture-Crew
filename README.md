# CaptureCrew

CaptureCrew is a modern online marketplace connecting users with professional photographers, videographers, and event planners. It simplifies the process of finding, booking, and managing event services.

## Features

-   **Service Discovery**: Browse and search for professionals by category (Photography, Videography, Event Planning) and price (in **BDT ৳**).
-   **Detailed Profiles**: View comprehensive service details, including pricing, descriptions, and portfolio images.
-   **Booking System**: Seamless booking flow with date selection and status tracking (Pending, Accepted, Rejected, Completed).
-   **Reviews & Ratings**: Customers can leave reviews and ratings for completed services.
-   **User Accounts**:
    -   **Secure Authentication**: Email/Password login via Supabase.
    -   **Role-Based Access**:
        -   **Customers**: Book services, leave reviews, view booking history, message providers.
        -   **Sellers**: Create services, manage bookings, view earnings reports, message clients.
        -   **Restrictions**: Sellers cannot book services or message other sellers.
    -   **Profile Management**: Upload profile pictures and manage account details.
-   **Real-time Messaging**: Chat directly with professionals or clients to discuss booking details.
-   **Profile Page**: Dedicated profile view with personal information, bio, and experience details.
-   **Seller Dashboard**:
    -   **Service Management**: Add, edit, and delete portfolio images.
    -   **Booking Management**: Accept/Reject bookings, mark as Completed/Paid.
    -   **Reports**: View detailed earnings reports and analytics.
-   **Modern UI**: Responsive design with a custom OKLCH color palette, dark mode support, and interactive elements.

## Tech Stack

-   **Frontend**:
    -   React (v19)
    -   Vite
    -   React Router (v7)
    -   Vanilla CSS (OKLCH variables)
-   **Backend**:
    -   Node.js
    -   Express.js
    -   Supabase Client (@supabase/supabase-js)
-   **Database**: Supabase (PostgreSQL)
-   **Authentication**: Custom JWT with Supabase Auth
-   **File Storage**: Supabase Storage (buckets: `profile-pictures`, `service-images`)

## Project Structure

```
Capture-Crew/
├── backend/                # Node.js/Express Backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Request handlers (auth, booking, messsage, etc.)
│   ├── middleware/         # Auth and upload middleware
│   ├── models/             # Database models/queries
│   ├── routes/             # API routes definition
│   ├── scripts/            # Utility scripts (e.g. database setup)
│   ├── uploads/            # Temporary file upload storage
│   ├── utils/              # Helper functions
│   └── server.js           # Entry point
│
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── assets/         # Static assets
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── pages/          # Application pages (Home, Login, Dashboard, etc.)
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Entry point
│   └── ...
└── database/               # Database related files
    └── schema.sql          # Supabase database schema
```

## Prerequisites

-   Node.js (v14 or higher)
-   Supabase Project

## Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Buri-Buri/Capture-Crew.git
    cd Capture-Crew
    ```

2.  **Backend Setup**:
    ```bash
    cd backend
    npm install
    ```
    -   Create a `.env` file in the `backend` directory:
        ```env
        PORT=5000
        SUPABASE_URL=your_supabase_url
        SUPABASE_KEY=your_supabase_anon_key
        JWT_SECRET=your_jwt_secret
        ```
    -   Start the server:
        ```bash
        npm start
        ```

3.  **Frontend Setup**:
    ```bash
    cd frontend
    npm install
    ```
    -   Start the development server:
        ```bash
        npm run dev
        ```

## Deployment

### Backend (Render)
1.  Push your code to GitHub.
2.  Create a new **Web Service** on [Render](https://render.com).
3.  Connect your GitHub repository.
4.  **Build Command**: `npm install`
5.  **Start Command**: `node server.js`
6.  **Root Directory**: `backend`
7.  **Environment Variables**: Add the same variables as your local `.env`.

### Frontend (Netlify/Vercel)
1.  Create a new site from Git.
2.  **Build Command**: `npm run build`
3.  **Output Directory**: `dist`
4.  **Root Directory**: `frontend`
5.  **Environment Variables**:
    -   `VITE_API_URL`: Your Backend URL (e.g., `https://your-app.onrender.com/api`)

## Database Setup

The application uses Supabase. Ensure your Supabase project has the following tables defined in `database/schema.sql`:
- `users`
- `services`
- `bookings`
- `messages`
- `notifications`
- `service_images`
- `reviews`

## License

This project is licensed under the MIT License.
