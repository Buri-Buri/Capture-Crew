# CaptureCrew

CaptureCrew is a modern online marketplace connecting users with professional photographers, videographers, and event planners. It simplifies the process of finding, booking, and managing event services.

## Features

-   **Service Discovery**: Browse and search for professionals by category (Photography, Videography, Event Planning) and price.
-   **Detailed Profiles**: View comprehensive service details, including pricing, descriptions, and portfolio images.
-   **Booking System**: Seamless booking flow with date selection and status tracking (Pending, Accepted, Rejected).
-   **User Accounts**:
    -   **Google OAuth2**: Fast and secure sign-up/login with Google.
    -   **Role-Based Access**: Separate dashboards for Customers (hire professionals) and Sellers (offer services).
    -   **Profile Management**: Upload profile pictures and manage account details.
-   **Seller Dashboard**: Manage services, view active bookings, and update booking statuses.
-   **Modern UI**: Responsive design with a custom OKLCH color palette and dark mode support.

## Tech Stack

-   **Frontend**: React, Vite, React Router, Vanilla CSS (OKLCH variables).
-   **Backend**: Node.js, Express.js.
-   **Database**: MySQL.
-   **Authentication**: JWT (JSON Web Tokens), Google OAuth2.
-   **File Storage**: Local storage (uploads directory) with Multer.

## Prerequisites

-   Node.js (v14 or higher)
-   MySQL Server
-   Google Cloud Console Project (for OAuth)

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
        DB_HOST=localhost
        DB_USER=root
        DB_PASSWORD=your_mysql_password
        DB_NAME=capturecrew
        JWT_SECRET=your_jwt_secret
        GOOGLE_CLIENT_ID=your_google_client_id
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
    -   Create a `.env` file in the `frontend` directory:
        ```env
        VITE_GOOGLE_CLIENT_ID=your_google_client_id
        ```
    -   Start the development server:
        ```bash
        npm run dev
        ```

## Database Setup

The application expects a MySQL database named `capturecrew`. The tables (`users`, `services`, `bookings`, etc.) will be created automatically or via migration scripts provided in the `backend` folder.

## Usage

1.  Open your browser and navigate to `http://localhost:5173`.
2.  **Sign Up**: Create an account as a "Customer" to book services or a "Seller" to list services.
3.  **Explore**: Use the search bar or browse categories to find professionals.
4.  **Book**: Select a service, choose a date, and submit a booking request.
5.  **Manage**: Sellers can accept/reject bookings from their dashboard.

## License

This project is licensed under the MIT License.
