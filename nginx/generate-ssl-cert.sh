#!/bin/bash

# Generate self-signed SSL certificate for development
# This script creates a self-signed certificate for local development only
# For production, use proper SSL certificates from a CA like Let's Encrypt

echo "Generating self-signed SSL certificate for development..."

# Create SSL directory if it doesn't exist
mkdir -p ./ssl

# Generate private key
openssl genrsa -out ./ssl/key.pem 2048

# Generate certificate signing request
openssl req -new -key ./ssl/key.pem -out ./ssl/cert.csr -subj "/C=US/ST=CA/L=San Jose/O=WayShare/OU=Development/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -in ./ssl/cert.csr -signkey ./ssl/key.pem -out ./ssl/cert.pem -days 365

# Clean up CSR file
rm ./ssl/cert.csr

echo "SSL certificate generated successfully!"
echo "Certificate: ./ssl/cert.pem"
echo "Private key: ./ssl/key.pem"
echo ""
echo "WARNING: This is a self-signed certificate for development only!"
echo "For production, use proper SSL certificates from a trusted CA."