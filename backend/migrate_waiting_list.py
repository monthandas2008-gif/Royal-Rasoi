import sqlite3

con = sqlite3.connect('royal_rasoi.db')
cur = con.cursor()
cols = [r[1] for r in cur.execute('PRAGMA table_info(waiting_list)').fetchall()]
new_cols = [
    ('token_ref', 'VARCHAR(20)'),
    ('payment_amount', 'FLOAT DEFAULT 0.0'),
    ('payment_status', 'VARCHAR(20) DEFAULT "paid"'),
    ('special_requests', 'TEXT'),
    ('phone', 'VARCHAR(20)'),
    ('confirmed_at', 'DATETIME'),
    ('refunded_at', 'DATETIME'),
    ('table_id', 'INTEGER')
]
for col_name, col_type in new_cols:
    if col_name not in cols:
        cur.execute(f'ALTER TABLE waiting_list ADD COLUMN {col_name} {col_type}')
        print(f'Added column {col_name}')
con.commit()
final_cols = [r[1] for r in cur.execute('PRAGMA table_info(waiting_list)').fetchall()]
print('Migration complete. Current columns:', final_cols)
con.close()
