### REint Assignment

This is a Next.js application that visualizes wind power generation data.

## Quick Links

- [Live Demo](https://reint-assignment.vercel.app/)
- [GitHub Repository](https://github.com/sohamingle/reint-assignment)

## Features

- **Actual vs Forecast**: Compare actual wind power generation against forecasted values.
- **Time Range Selection**: Adjust the time range and forecast horizon.
- **Theme Toggle**: Switch between light and dark mode.
- **Responsive Design**: The application is fully responsive and works on all devices.
- **Debounced Fetching**: The data is fetched with a debounce of 400ms to prevent excessive API calls.

## Analysis

- Python Notebook is present in the `analysis` directory. [Click here to view](analysis/analysis.ipynb)

## Tech Stack

- **Next.js**: React framework for server-side rendering and static site generation.
- **Shadcn/UI**: Component library for building the UI.
- **Recharts**: Charting library for visualizing the data.
- **Tailwind CSS**: Utility-first CSS framework for styling.

## Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2.  Navigate to the project directory:

    ```bash
    cd reint-assignment
    ```

3.  Install dependencies:

    ```bash
    bun install
    ```

4.  Run the development server:
    ```bash
    bun run dev
    ```

## Usage

1.  Open the application in your browser:

    ```
    http://localhost:3000
    ```

2.  Adjust the time range and forecast horizon using the input fields.

3.  The chart will automatically update to display the wind power generation data.
