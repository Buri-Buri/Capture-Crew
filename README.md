# CaptureCrew

CaptureCrew is a modern online marketplace connecting users with professional photographers, videographers, and event planners. It simplifies the process of finding, booking, and managing event services.

## Features

-   **Service Discovery**: Browse and search for professionals by category (Photography, Videography, Event Planning) and price.
-   **Detailed Profiles**: View comprehensive service details, including pricing, descriptions, and portfolio images.
-   **Booking System**: Seamless booking flow with date selection and status tracking (Pending, Accepted, Rejected).
-   **Reviews & Ratings**: Customers can leave reviews and ratings for services they've booked.
-   **User Accounts**:
    -   **Secure Authentication**: Email/Password login via Supabase.
    -   **Role-Based Access**:
        -   **Customers**: Book services, leave reviews, view booking history.
        -   **Sellers**: Create services, manage bookings, view earnings reports.
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

-   **Frontend**: React, Vite, React Router, Vanilla CSS (OKLCH variables).
-   **Backend**: Node.js, Express.js.
-   **Database**: Supabase (PostgreSQL).
-   **Authentication**: Custom JWT with Supabase.
-   **File Storage**: Supabase Storage (for profile pictures and portfolio images).

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

## Database Setup

The application uses Supabase. Ensure your Supabase project has the following tables:
- `users`
- `services`
- `bookings`
- `messages`
- `service_images`

You can find the schema definition in `database/schema.sql`.

## Usage

1.  Open your browser and navigate to `http://localhost:5173`.
2.  **Sign Up**: Create an account as a "Customer" to book services or a "Seller" to list services.
3.  **Explore**: Use the search bar or browse categories to find professionals.
4.  **Book**: Select a service, choose a date, and submit a booking request.
5.  **Manage**: Sellers can accept/reject bookings from their dashboard.

## License

This project is licensed under the MIT License.

