#!/bin/bash
echo "Resetting all passwords to 'password'..."
psql -U user -d smart_export_db -c "
UPDATE users SET 
  password_hash = '\$2a\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  failed_attempts = 0,
  status = 'ACTIVE';"
echo "✅ Done! All accounts password: 'password'"
psql -U user -d smart_export_db -c "
SELECT id, email, role, status FROM users 
ORDER BY id;"
