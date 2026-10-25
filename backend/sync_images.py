import sqlite3

updates = [
    ('https://carveyourcraving.com/wp-content/uploads/2024/03/hara-bhara-kebab_.jpg', 'Hara Bhara Kebab'),
    ('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAUKxBzZ_HndwxKHjiyyfg19T-uJ2eKuegcd6TuZnIwiXNiuZRawHWeIv5&s=10', 'Mutton Biryani'),
    ('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAUKxBzZ_HndwxKHjiyyfg19T-uJ2eKuegcd6TuZnIwiXNiuZRawHWeIv5&s=10', 'Mutton Dum Biryani'),
    ('https://static.toiimg.com/thumb/53338316.cms?imgsize=223266&width=800&height=800', 'Butter Naan'),
    ('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSQCsjTgjFIBx-6tupHdYowJClovHbU5Gv7AI-4MfByydcPk0XGstiZ2U&s=10', 'Garlic Naan'),
]

con = sqlite3.connect('royal_rasoi.db')
cur = con.cursor()
for image_url, name in updates:
    cur.execute('UPDATE menu_items SET image_url = ? WHERE name = ?', (image_url, name))
    print(f'Updated {cur.rowcount} row(s) for: {name}')
con.commit()
con.close()
print('Done. Database synced successfully.')
