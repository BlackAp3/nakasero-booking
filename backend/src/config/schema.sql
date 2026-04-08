-- DEPARTMENTS
CREATE TABLE departments (
  department_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- USERS
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin','marketing','supervisor','receptionist')),
  department_id INT REFERENCES departments(department_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DOCTORS
CREATE TABLE doctors (
  doctor_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  room VARCHAR(50),
  photo VARCHAR(255),
  department_id INT NOT NULL REFERENCES departments(department_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DOCTOR SCHEDULES
CREATE TABLE doctor_schedules (
  schedule_id SERIAL PRIMARY KEY,
  doctor_id INT NOT NULL REFERENCES doctors(doctor_id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- PATIENTS
CREATE TABLE patients (
  patient_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(15) NOT NULL,
  gender VARCHAR(20),
  next_of_kin_name VARCHAR(255) NOT NULL,
  next_of_kin_phone VARCHAR(20) NOT NULL,
  next_of_kin_relationship VARCHAR(50) NOT NULL,
  department_id INT NOT NULL REFERENCES departments(department_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOOKINGS
CREATE TABLE bookings (
  booking_id SERIAL PRIMARY KEY,
  patient_id INT NOT NULL REFERENCES patients(patient_id),
  doctor_id INT NOT NULL REFERENCES doctors(doctor_id),
  department_id INT NOT NULL REFERENCES departments(department_id),
  appointment_type VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(10) NOT NULL,
  status VARCHAR(10) DEFAULT 'pending' CHECK (status IN ('pending','confirmed','canceled')),
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (doctor_id, date, time)
);

-- SIGNAGE VIDEOS
CREATE TABLE signage_videos (
  video_id SERIAL PRIMARY KEY,
  department_id INT NOT NULL REFERENCES departments(department_id),
  title VARCHAR(100),
  youtube_url VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ANNOUNCEMENTS
CREATE TABLE announcements (
  announcement_id SERIAL PRIMARY KEY,
  department_id INT NOT NULL REFERENCES departments(department_id),
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT LOG
CREATE TABLE audit_log (
  log_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_affected VARCHAR(50),
  record_id INT,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS specializations (
  specialization_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);