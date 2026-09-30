import csv
import random

categorias = {
    "Computación": ["Notebook", "Monitor", "Teclado", "Mouse", "Tablet"],
    "Telefonía": ["Smartphone", "Cargador", "Funda", "Audífonos"],
    "Audio": ["Parlante", "Audífonos", "Micrófono"],
    "Gaming": ["Consola", "Joystick", "Silla Gamer", "Mouse Gamer"],
    "Hogar": ["Refrigerador", "Microondas", "Aspiradora", "Cafetera"],
    "Moda": ["Polera", "Zapatillas", "Chaqueta", "Mochila"],
}

marcas = ["Astra", "Nova", "Vertex", "Lumen", "Kronos", "Zenit", "Orion", "Pulse"]

def generar_producto(i):
    categoria = random.choice(list(categorias.keys()))
    formato = random.choice(categorias[categoria])
    marca = random.choice(marcas)
    nombre = f"{marca} {formato} {random.randint(100, 999)}"
    precio = random.randint(9990, 999990)
    stock = random.randint(0, 150)
    imagen = f"https://picsum.photos/seed/{i}/400/300"
    descripcion = f"{formato} {marca} ideal para uso diario."
    return [i, nombre, precio, categoria, formato, stock, imagen, descripcion]

with open("catalog.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["id", "nombre", "precio", "categoria", "formato", "stock", "imagen", "descripcion"])
    for i in range(1, 4033):
        writer.writerow(generar_producto(i))

print("catalog.csv generado con 4032 productos")