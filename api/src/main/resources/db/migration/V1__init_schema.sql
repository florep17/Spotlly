-- V1: Initial schema for Spotly database based on Technical Specification

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    oauth_provider VARCHAR(50),
    oauth_sub VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parking_spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    spot_number VARCHAR(50),
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    address_street VARCHAR(255) NOT NULL,
    address_city VARCHAR(100) NOT NULL,
    spot_type VARCHAR(50) NOT NULL,
    max_vehicle_size VARCHAR(50) NOT NULL,
    max_height_meters NUMERIC(4, 2),
    has_ev_charging BOOLEAN NOT NULL DEFAULT FALSE,
    access_type VARCHAR(50) NOT NULL,
    gate_pin_code VARCHAR(100),
    gate_phone_number VARCHAR(50),
    access_instructions TEXT,
    hourly_rate NUMERIC(8, 2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sync_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS spot_availabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spot_id UUID NOT NULL REFERENCES parking_spots(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    spot_id UUID NOT NULL REFERENCES parking_spots(id) ON DELETE RESTRICT,
    driver_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    vehicle_plate_number VARCHAR(50) NOT NULL,
    start_time_utc BIGINT NOT NULL,
    end_time_utc BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    total_charged NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'PLN',
    access_status VARCHAR(50) NOT NULL DEFAULT 'LOCKED_UNTIL_15M_BEFORE',
    access_unlock_time_utc BIGINT,
    payment_method_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_parking_spots_owner ON parking_spots(owner_id);
CREATE INDEX IF NOT EXISTS idx_parking_spots_coords ON parking_spots(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_spot_availabilities_spot ON spot_availabilities(spot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_spot_window ON bookings(spot_id, start_time_utc, end_time_utc);
CREATE INDEX IF NOT EXISTS idx_bookings_driver ON bookings(driver_id);
