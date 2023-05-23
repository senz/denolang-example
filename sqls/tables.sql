CREATE DATABASE IF NOT EXISTS employees;

USE employees;
-- Adjacency List Model
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    supervisor_id INT,
    FOREIGN KEY (supervisor_id) REFERENCES employees(id)
);