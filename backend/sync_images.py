import sqlite3

# Updated with stable Unsplash CDN URLs replacing broken encrypted-tbn0.gstatic.com thumbnails
updates = [
    ('https://carveyourcraving.com/wp-content/uploads/2024/03/hara-bhara-kebab_.jpg', 'Hara Bhara Kebab'),
    ('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 'Mutton Biryani'),
    ('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 'Mutton Dum Biryani'),
    ('https://static.toiimg.com/thumb/53338316.cms?imgsize=223266&width=800&height=800', 'Butter Naan'),
    ('https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80', 'Garlic Naan'),
    ('https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80', 'Laccha Paratha'),
    ('https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80', 'Vegetable Dum Biryani'),
    ('https://images.unsplash.com/photo-1601303516534-bf4ec6b4a19e?w=600&auto=format&fit=crop&q=80', 'Gulab Jamun'),
    ('https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=600&auto=format&fit=crop&q=80', 'Kulfi Falooda'),
    ('https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&auto=format&fit=crop&q=80', 'Kesar Mango Lassi'),
]

con = sqlite3.connect('royal_rasoi.db')
cur = con.cursor()
for image_url, name in updates:
    cur.execute('UPDATE menu_items SET image_url = ? WHERE name = ?', (image_url, name))
    print(f'Updated {cur.rowcount} row(s) for: {name}')
con.commit()
con.close()
print('Done. Database synced successfully.')
