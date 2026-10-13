
# Spotly

**Spotly** is a mobile application designed to help residents of apartment buildings and housing estates share and rent private parking spaces.

The idea behind Spotly is simple: many private parking spaces remain unused for several hours a day, while other drivers struggle to find available parking.

Spotly connects parking space owners with drivers looking for convenient, affordable, short-term parking solutions.

The application allows owners to earn money from unused parking spaces while helping drivers save time and avoid the frustration of searching for parking.

## Features

The application is planned to include:

- **User Authentication** – Sign in with Google or Apple.
- **Parking Listings** – Add and manage private parking spaces.
- **Availability Calendar** – Set available hours and manage parking schedules.
- **Parking Search** – Find available parking spaces based on location, date, time, and price.
- **Smart Parking Matching** – A C++ engine responsible for filtering, matching, and ranking available parking spaces.
- **Booking System** – Reserve parking spaces for selected time periods.
- **Interactive Map** – Explore available parking spaces nearby.
- **Parking Access Information** – Receive parking location details and entry instructions before a reservation begins.
- **Parking Session Management** – Track parking duration and request booking extensions.
- **Delay Management** – Handle parking extensions, additional charges, and owner notifications.
- **Payment System** – Simulate parking payments in a test environment.
- **User Dashboard** – Manage parking listings, availability, and reservations.

## Tech Stack

### Mobile Application
- React Native
- TypeScript

### Backend
- Java
- Spring Boot
- C++
- Crow

### Database
- PostgreSQL

### Authentication
- Google / Apple Sign-In

### Testing
- Cucumber – BDD and acceptance testing
- GoogleTest – C++ unit testing
- libFuzzer – Fuzz testing

### Design
- Figma

## Architecture

Spotly follows a modular architecture consisting of three main components:

**1. React Native Mobile Application**

Provides the user interface, interactive parking map, authentication, parking search, booking management, and user dashboard.

**2. Java Backend (Spring Boot)**

Handles business logic, REST API communication, parking reservations, payment simulation, and database operations.

**3. C++ Parking Matching Engine (Crow)**

Responsible for parking availability filtering, matching algorithms, and ranking parking spaces based on location and availability.

**PostgreSQL** is used for persistent data storage.

## Main Use Cases

### Parking Space Owner
1. Adds a private parking space.
2. Sets the hourly price and availability schedule.
3. Provides parking access instructions.
4. Manages reservations and availability.
5. Receives notifications about bookings and delays.

### Driver
1. Searches for parking near a selected destination.
2. Specifies the desired parking time.
3. Browses available parking spaces on a map.
4. Selects and books a parking space.
5. Completes a simulated payment.
6. Receives parking access information.
7. Manages or extends the parking session when available.

## Development Approach

Spotly follows an **evolutionary prototyping approach**.

The initial version will focus on the core functionality:
- Adding parking spaces
- Managing availability
- Searching for available parking
- Creating reservations

Future iterations will extend the application with:
- Advanced parking ranking algorithms
- Payment simulation
- Notifications
- Parking session extensions and delay management

## Team

| Team Member | Responsibilities |
|-------------|------------------|
| Zuzanna Kot | C++, Crow, parking matching algorithms, Cucumber, GoogleTest, fuzz testing |
| Maximilien Klima | Java, Spring Boot, PostgreSQL, REST API, booking system, payment simulation |
| Florian Kurpiela | React Native, TypeScript, Figma, UI/UX, interactive map, Google/Apple authentication |

## Project Status

**Under Development**

Spotly is being developed as a university software engineering project, focusing on mobile application development, backend architecture, parking optimization algorithms, software testing, database management, and user experience.
