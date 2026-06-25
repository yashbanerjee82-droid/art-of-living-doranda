const fs = require('fs');
let sql = fs.readFileSync('supabase.sql', 'utf8');

// 1. Make tables IF NOT EXISTS
sql = sql.replace(/CREATE TABLE public\.([a-z_]+) \(/g, 'CREATE TABLE IF NOT EXISTS public.$1 (');

// 2. Make policies re-runnable
sql = sql.replace(/CREATE POLICY "([^"]+)" ON public\.([a-z_]+)/g, 'DROP POLICY IF EXISTS "$1" ON public.$2;\nCREATE POLICY "$1" ON public.$2');

// 3. Make triggers re-runnable
sql = sql.replace(/CREATE TRIGGER (\w+)\s+(BEFORE|AFTER) (INSERT|UPDATE|DELETE) ON public\.([a-z_]+)/g, 'DROP TRIGGER IF EXISTS $1 ON public.$4;\nCREATE TRIGGER $1\n  $2 $3 ON public.$4');
sql = sql.replace(/CREATE CONSTRAINT TRIGGER (\w+)\s+(BEFORE|AFTER) (INSERT|UPDATE|DELETE) ON public\.([a-z_]+)/g, 'DROP TRIGGER IF EXISTS $1 ON public.$4;\nCREATE CONSTRAINT TRIGGER $1\n  $2 $3 ON public.$4');

fs.writeFileSync('supabase.sql', sql, 'utf8');
console.log('Rewritten supabase.sql');
