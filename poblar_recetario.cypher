// ============================================================
// SCRIPT DE POBLADO - BASE DE DATOS DE RECETAS CON ENLACES Y RELACIONES SOCIALES
// ============================================================

// ---- LIMPIAR DATOS EXISTENTES ----
MATCH (n) DETACH DELETE n;

// ============================================================
// 1. CATEGORIAS
// ============================================================
CREATE (c1:Categoria {nombre: 'SIN TACC'})
CREATE (c2:Categoria {nombre: 'Vegetariano'})
CREATE (c3:Categoria {nombre: 'Vegano'})
CREATE (c4:Categoria {nombre: 'Pastas'})
CREATE (c5:Categoria {nombre: 'Postre'})
CREATE (c6:Categoria {nombre: 'Comida rápida'})
CREATE (c7:Categoria {nombre: 'Bebidas'})
CREATE (c8:Categoria {nombre: 'Carnes'})
CREATE (c9:Categoria {nombre: 'Minutas'})
CREATE (c10:Categoria {nombre: 'Panadería'});

// ============================================================
// 2. USUARIOS
// ============================================================
CREATE (u1:Usuario {nombre: 'Ornella', mail: 'ornella@mail.com', contrasena: 'pass123'})
CREATE (u2:Usuario {nombre: 'Juan', mail: 'juan@mail.com', contrasena: 'pass456'})
CREATE (u3:Usuario {nombre: 'Ana', mail: 'ana@mail.com', contrasena: 'pass789'})
CREATE (u4:Usuario {nombre: 'Martín', mail: 'martin@mail.com', contrasena: 'pass321'})
CREATE (u5:Usuario {nombre: 'Sofía', mail: 'sofia@mail.com', contrasena: 'pass654'})
CREATE (u6:Usuario {nombre: 'Carlos', mail: 'carlos@mail.com', contrasena: 'pass987'});

// ============================================================
// 3. INGREDIENTES
// ============================================================
MERGE (i1:Ingrediente {nombre: 'Lentejas'})
MERGE (i2:Ingrediente {nombre: 'Cebolla'})
MERGE (i3:Ingrediente {nombre: 'Zanahoria'})
MERGE (i4:Ingrediente {nombre: 'Ajo'})
MERGE (i5:Ingrediente {nombre: 'Pimiento'})
MERGE (i6:Ingrediente {nombre: 'Sal'})
MERGE (i7:Ingrediente {nombre: 'Pimienta'})
MERGE (i8:Ingrediente {nombre: 'Aceite'})
MERGE (i9:Ingrediente {nombre: 'Pollo'})
MERGE (i10:Ingrediente {nombre: 'Brócoli'})
MERGE (i11:Ingrediente {nombre: 'Jengibre'})
MERGE (i12:Ingrediente {nombre: 'Salsa de Soja'})
MERGE (i13:Ingrediente {nombre: 'Harina'})
MERGE (i14:Ingrediente {nombre: 'Salsa de Tomate'})
MERGE (i15:Ingrediente {nombre: 'Queso Muzzarella'})
MERGE (i16:Ingrediente {nombre: 'Albahaca'})
MERGE (i17:Ingrediente {nombre: 'Levadura'})
MERGE (i18:Ingrediente {nombre: 'Berenjena'})
MERGE (i19:Ingrediente {nombre: 'Huevo'})
MERGE (i20:Ingrediente {nombre: 'Pan Rallado'})
MERGE (i21:Ingrediente {nombre: 'Palta'})
MERGE (i22:Ingrediente {nombre: 'Cilantro'})
MERGE (i23:Ingrediente {nombre: 'Limón'})
MERGE (i24:Ingrediente {nombre: 'Nachos'})
MERGE (i25:Ingrediente {nombre: 'Tomate'})
MERGE (i26:Ingrediente {nombre: 'Lechuga'})
MERGE (i27:Ingrediente {nombre: 'Fideos'})
MERGE (i28:Ingrediente {nombre: 'Carne Picada'})
MERGE (i29:Ingrediente {nombre: 'Papa'})
MERGE (i30:Ingrediente {nombre: 'Manteca'})
MERGE (i31:Ingrediente {nombre: 'Leche'})
MERGE (i32:Ingrediente {nombre: 'Azúcar'})
MERGE (i33:Ingrediente {nombre: 'Esencia de Vainilla'})
MERGE (i34:Ingrediente {nombre: 'Chocolate'})
MERGE (i35:Ingrediente {nombre: 'Polvo de Hornear'})
MERGE (i36:Ingrediente {nombre: 'Orégano'})
MERGE (i37:Ingrediente {nombre: 'Laurel'})
MERGE (i38:Ingrediente {nombre: 'Noodles de Arroz'})
MERGE (i39:Ingrediente {nombre: 'Queso Parmesano'})
MERGE (i40:Ingrediente {nombre: 'Hongos'})
MERGE (i41:Ingrediente {nombre: 'Ginebra'})
MERGE (i42:Ingrediente {nombre: 'Campari'})
MERGE (i43:Ingrediente {nombre: 'Vermut Rojo'})
MERGE (i44:Ingrediente {nombre: 'Arroz Carnaroli'})
MERGE (i45:Ingrediente {nombre: 'Azafrán'})
MERGE (i46:Ingrediente {nombre: 'Cebolla de Verdeo'})
MERGE (i47:Ingrediente {nombre: 'Crema de Leche'})
MERGE (i48:Ingrediente {nombre: 'Queso Cheddar'})
MERGE (i49:Ingrediente {nombre: 'Pan de Hamburguesa'})
MERGE (i50:Ingrediente {nombre: 'Tortillas de Maíz'})
MERGE (i51:Ingrediente {nombre: 'Carne de Res'})
MERGE (i52:Ingrediente {nombre: 'Fernet'})
MERGE (i53:Ingrediente {nombre: 'Bebida de Cola'})
MERGE (i54:Ingrediente {nombre: 'Hielo'})
MERGE (i55:Ingrediente {nombre: 'Tira de Asado'})
MERGE (i56:Ingrediente {nombre: 'Sal Gruesa'})
MERGE (i57:Ingrediente {nombre: 'Lomo'})
MERGE (i58:Ingrediente {nombre: 'Jamón Cocido'})
MERGE (i59:Ingrediente {nombre: 'Carne Vacuna'})
MERGE (i60:Ingrediente {nombre: 'Perejil'});

// ============================================================
// 4. RECETAS
// ============================================================

// ---------- 4.1 Guiso de lentejas (SIN TACC) ----------
MATCH (cat:Categoria {nombre: 'SIN TACC'})
MATCH (user:Usuario {nombre: 'Ornella'})
MATCH (lentejas:Ingrediente {nombre: 'Lentejas'})
MATCH (cebolla:Ingrediente {nombre: 'Cebolla'})
MATCH (zanahoria:Ingrediente {nombre: 'Zanahoria'})
MATCH (ajo:Ingrediente {nombre: 'Ajo'})
MATCH (pimiento:Ingrediente {nombre: 'Pimiento'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
MATCH (pimienta:Ingrediente {nombre: 'Pimienta'})
MATCH (aceite:Ingrediente {nombre: 'Aceite'})
MATCH (laurel:Ingrediente {nombre: 'Laurel'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Guiso de lentejas',
  descripcion: 'Un guiso hearty y reconfortante de lentejas con verduras, perfecto para días fríos',
  dificultad: 'Alta',
  tiempo: '60 min',
  imagen: 'https://images.unsplash.com/photo-1579640873954-766bf0235bf3?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Remojar las lentejas la noche anterior. 2. Picar cebolla, ajo, zanahoria y pimiento en cubos. 3. Rehogar las verduras en aceite hasta que estén tiernas. 4. Agregar las lentejas escurridas, cubrir con agua y añadir laurel. 5. Cocinar a fuego medio por 40 min revolviendo ocasionalmente. 6. Salpimentar a gusto y servir caliente.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '400g'}]->(lentejas)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(cebolla)
CREATE (r)-[:CONTIENE {cantidad: '2 unidades'}]->(zanahoria)
CREATE (r)-[:CONTIENE {cantidad: '2 dientes'}]->(ajo)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(pimiento)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(pimienta)
CREATE (r)-[:CONTIENE {cantidad: '3 cdas'}]->(aceite)
CREATE (r)-[:CONTIENE {cantidad: '1 hoja'}]->(laurel);

// ---------- 4.2 Wok de verduras con pollo (SIN TACC) ----------
MATCH (cat:Categoria {nombre: 'SIN TACC'})
MATCH (user:Usuario {nombre: 'Ornella'})
MATCH (pollo:Ingrediente {nombre: 'Pollo'})
MATCH (brocoli:Ingrediente {nombre: 'Brócoli'})
MATCH (zanahoria:Ingrediente {nombre: 'Zanahoria'})
MATCH (pimiento:Ingrediente {nombre: 'Pimiento'})
MATCH (cebolla:Ingrediente {nombre: 'Cebolla'})
MATCH (jengibre:Ingrediente {nombre: 'Jengibre'})
MATCH (soja:Ingrediente {nombre: 'Salsa de Soja'})
MATCH (aceite:Ingrediente {nombre: 'Aceite'})
MATCH (noodles:Ingrediente {nombre: 'Noodles de Arroz'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Wok de verduras con pollo',
  descripcion: 'Salteado rápido de pollo y verduras con noodles de arroz, libre de gluten',
  dificultad: 'Media',
  tiempo: '25 min',
  imagen: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Cortar el pollo en tiras finas y salpimentar. 2. Picar todas las verduras en juliana. 3. Hidratar los noodles de arroz en agua caliente por 5 min y escurrir. 4. Saltear el pollo en el wok con aceite hasta dorar, reservar. 5. Saltear las verduras con jengibre rallado por 3 min. 6. Agregar el pollo, los noodles y la salsa de soja. 7. Saltear todo junto por 2 min y servir.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '300g'}]->(pollo)
CREATE (r)-[:CONTIENE {cantidad: '1 taza'}]->(brocoli)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(zanahoria)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(pimiento)
CREATE (r)-[:CONTIENE {cantidad: '1/2 unidad'}]->(cebolla)
CREATE (r)-[:CONTIENE {cantidad: '1 cdita'}]->(jengibre)
CREATE (r)-[:CONTIENE {cantidad: '3 cdas'}]->(soja)
CREATE (r)-[:CONTIENE {cantidad: '2 cdas'}]->(aceite)
CREATE (r)-[:CONTIENE {cantidad: '200g'}]->(noodles)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal);

// ---------- 4.3 Pizza margherita (Vegetariano) ----------
MATCH (cat:Categoria {nombre: 'Vegetariano'})
MATCH (user:Usuario {nombre: 'Juan'})
MATCH (harina:Ingrediente {nombre: 'Harina'})
MATCH (salsa:Ingrediente {nombre: 'Salsa de Tomate'})
MATCH (muzza:Ingrediente {nombre: 'Queso Muzzarella'})
MATCH (albahaca:Ingrediente {nombre: 'Albahaca'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
MATCH (aceite:Ingrediente {nombre: 'Aceite'})
MATCH (levadura:Ingrediente {nombre: 'Levadura'})
MATCH (oregano:Ingrediente {nombre: 'Orégano'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Pizza margherita',
  descripcion: 'Pizza italiana clásica con salsa de tomate, muzzarella y albahaca fresca',
  dificultad: 'Media',
  tiempo: '45 min',
  imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Mezclar harina, levadura, sal y agua tibia. Amasar por 10 min hasta obtener masa lisa. 2. Dejar reposar tapada por 20 min. 3. Estirar la masa en forma circular. 4. Cubrir con salsa de tomate, muzzarella en cubos y orégano. 5. Hornear a 220°C por 15 min. 6. Agregar albahaca fresca al salir del horno.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '500g'}]->(harina)
CREATE (r)-[:CONTIENE {cantidad: '200ml'}]->(salsa)
CREATE (r)-[:CONTIENE {cantidad: '200g'}]->(muzza)
CREATE (r)-[:CONTIENE {cantidad: '2 ramitas'}]->(albahaca)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal)
CREATE (r)-[:CONTIENE {cantidad: '2 cdas'}]->(aceite)
CREATE (r)-[:CONTIENE {cantidad: '25g'}]->(levadura)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(oregano);

// ---------- 4.5 Guacamole con nachos (Vegano) ----------
MATCH (cat:Categoria {nombre: 'Vegano'})
MATCH (user:Usuario {nombre: 'Ana'})
MATCH (palta:Ingrediente {nombre: 'Palta'})
MATCH (tomate:Ingrediente {nombre: 'Tomate'})
MATCH (cebolla:Ingrediente {nombre: 'Cebolla'})
MATCH (cilantro:Ingrediente {nombre: 'Cilantro'})
MATCH (limon:Ingrediente {nombre: 'Limón'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
MATCH (nachos:Ingrediente {nombre: 'Nachos'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Guacamole con nachos',
  descripcion: 'Dip cremoso de palta con tomate y cilantro, acompañado de nachos crujientes',
  dificultad: 'Baja',
  tiempo: '10 min',
  imagen: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Cortar las paltas por la mitad, retirar el carozo y pisar la pulpa con un tenedor. 2. Picar el tomate, la cebolla y el cilantro finamente. 3. Mezclar todo con la palta pisada. 4. Agregar jugo de limón y sal a gusto. 5. Servir inmediatamente con nachos.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '2 unidades'}]->(palta)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(tomate)
CREATE (r)-[:CONTIENE {cantidad: '1/4 unidad'}]->(cebolla)
CREATE (r)-[:CONTIENE {cantidad: '1 puñado'}]->(cilantro)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(limon)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal)
CREATE (r)-[:CONTIENE {cantidad: '1 bolsa'}]->(nachos);

// ---------- 4.6 Ensalada primavera (Vegano) ----------
MATCH (cat:Categoria {nombre: 'Vegano'})
MATCH (user:Usuario {nombre: 'Ornella'})
MATCH (lechuga:Ingrediente {nombre: 'Lechuga'})
MATCH (tomate:Ingrediente {nombre: 'Tomate'})
MATCH (zanahoria:Ingrediente {nombre: 'Zanahoria'})
MATCH (cebolla:Ingrediente {nombre: 'Cebolla'})
MATCH (aceite:Ingrediente {nombre: 'Aceite'})
MATCH (limon:Ingrediente {nombre: 'Limón'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Ensalada primavera',
  descripcion: 'Ensalada fresca y colorida con verduras de estación, aliño cítrico',
  dificultad: 'Baja',
  tiempo: '15 min',
  imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Lavar y cortar la lechuga en trozos. 2. Cortar el tomate en cubos y la zanahoria en juliana. 3. Cortar la cebolla en aros finos. 4. Mezclar todas las verduras en un bowl. 5. Aliñar con aceite, jugo de limón y sal a gusto. 6. Mezclar bien y servir fría.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '1 planta'}]->(lechuga)
CREATE (r)-[:CONTIENE {cantidad: '2 unidades'}]->(tomate)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(zanahoria)
CREATE (r)-[:CONTIENE {cantidad: '1/2 unidad'}]->(cebolla)
CREATE (r)-[:CONTIENE {cantidad: '3 cdas'}]->(aceite)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(limon)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal);

// ---------- 4.7 Tallarines con bolognesa (Pastas) ----------
MATCH (cat:Categoria {nombre: 'Pastas'})
MATCH (user:Usuario {nombre: 'Juan'})
MATCH (fideos:Ingrediente {nombre: 'Fideos'})
MATCH (carne:Ingrediente {nombre: 'Carne Picada'})
MATCH (salsa:Ingrediente {nombre: 'Salsa de Tomate'})
MATCH (cebolla:Ingrediente {nombre: 'Cebolla'})
MATCH (ajo:Ingrediente {nombre: 'Ajo'})
MATCH (aceite:Ingrediente {nombre: 'Aceite'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
MATCH (pimienta:Ingrediente {nombre: 'Pimienta'})
MATCH (queso:Ingrediente {nombre: 'Queso Parmesano'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Tallarines con bolognesa',
  descripcion: 'Clásica pasta italiana con salsa bolognesa casera y queso parmesano',
  dificultad: 'Media',
  tiempo: '40 min',
  imagen: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Picar cebolla y ajo finamente y rehogar en aceite. 2. Agregar la carne picada y cocinar hasta que se dore. 3. Incorporar la salsa de tomate, sal y pimienta. 4. Cocinar la salsa a fuego bajo por 20 min. 5. Hervir los tallarines en agua con sal hasta que estén al dente. 6. Servir la salsa sobre los tallarines y espolvorear con parmesano.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '400g'}]->(fideos)
CREATE (r)-[:CONTIENE {cantidad: '300g'}]->(carne)
CREATE (r)-[:CONTIENE {cantidad: '300ml'}]->(salsa)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(cebolla)
CREATE (r)-[:CONTIENE {cantidad: '2 dientes'}]->(ajo)
CREATE (r)-[:CONTIENE {cantidad: '2 cdas'}]->(aceite)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(pimienta)
CREATE (r)-[:CONTIENE {cantidad: '50g'}]->(queso);

// ---------- 4.8 Ñoquis de papa (Pastas) ----------
MATCH (cat:Categoria {nombre: 'Pastas'})
MATCH (user:Usuario {nombre: 'Ana'})
MATCH (papa:Ingrediente {nombre: 'Papa'})
MATCH (harina:Ingrediente {nombre: 'Harina'})
MATCH (huevo:Ingrediente {nombre: 'Huevo'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
MATCH (salsa:Ingrediente {nombre: 'Salsa de Tomate'})
MATCH (queso:Ingrediente {nombre: 'Queso Parmesano'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Ñoquis de papa',
  descripcion: 'Ñoquis caseros de papa servidos con salsa tuco y abundante queso rallado, tal como se acostumbra comer en los hogares argentinos',
  dificultad: 'Alta',
  tiempo: '60 min',
  imagen: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Plato_de_%C3%B1oquis_argentinos_con_salsa_de_carne_y_tomate_con_queso_rallado.jpg',
  pasos: '1. Hervir las papas con cáscara hasta que estén tiernas. 2. Pelar y hacer un puré, dejar enfriar. 3. Agregar harina, huevo y sal, amasar hasta formar una masa suave. 4. Formar cilindros y cortar en cubitos de 2 cm. 5. Marcar con la ñoquera o un tenedor. 6. Cocinar en agua hirviendo con sal hasta que floten (2-3 min). 7. Servir con salsa de tomate y carne (tuco) y queso parmesano rallado.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '1kg'}]->(papa)
CREATE (r)-[:CONTIENE {cantidad: '300g'}]->(harina)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(huevo)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal)
CREATE (r)-[:CONTIENE {cantidad: '250ml'}]->(salsa)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(queso);

// ---------- 4.9 Flan casero (Postre) ----------
MATCH (cat:Categoria {nombre: 'Postre'})
MATCH (user:Usuario {nombre: 'Ornella'})
MATCH (leche:Ingrediente {nombre: 'Leche'})
MATCH (huevo:Ingrediente {nombre: 'Huevo'})
MATCH (azucar:Ingrediente {nombre: 'Azúcar'})
MATCH (vainilla:Ingrediente {nombre: 'Esencia de Vainilla'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Flan casero',
  descripcion: 'Flan cremoso y suave, el postre clásico argentino servido tradicionalmente mixto (con dulce de leche y crema batida)',
  dificultad: 'Baja',
  tiempo: '90 min',
  imagen: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Flan_con_dulce_de_leche_y_crema.jpg',
  pasos: '1. Preparar el caramelo: derretir azúcar en una sartén hasta que tome color ámbar y volcar en el molde. 2. Mezclar leche, huevos, azúcar y esencia de vainilla. Batir suavemente sin generar espuma. 3. Verter la mezcla en el molde acaramelado. 4. Cocinar al baño María en horno a 160°C por 60 min. 5. Dejar enfriar y refrigerar por al menos 4 horas. 6. Desmoldar y servir acompañado con dulce de leche y crema batida (mixto).'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '500ml'}]->(leche)
CREATE (r)-[:CONTIENE {cantidad: '4 unidades'}]->(huevo)
CREATE (r)-[:CONTIENE {cantidad: '200g'}]->(azucar)
CREATE (r)-[:CONTIENE {cantidad: '1 cdita'}]->(vainilla);

// ---------- 4.10 Torta de chocolate (Postre) ----------
MATCH (cat:Categoria {nombre: 'Postre'})
MATCH (user:Usuario {nombre: 'Juan'})
MATCH (harina:Ingrediente {nombre: 'Harina'})
MATCH (azucar:Ingrediente {nombre: 'Azúcar'})
MATCH (leche:Ingrediente {nombre: 'Leche'})
MATCH (huevo:Ingrediente {nombre: 'Huevo'})
MATCH (chocolate:Ingrediente {nombre: 'Chocolate'})
MATCH (manteca:Ingrediente {nombre: 'Manteca'})
MATCH (levadura:Ingrediente {nombre: 'Polvo de Hornear'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Torta de chocolate',
  descripcion: 'Torta húmeda y esponjosa de chocolate, ideal para cualquier ocasión',
  dificultad: 'Media',
  tiempo: '50 min',
  imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Derretir el chocolate con la manteca a baño María. 2. Batir los huevos con el azúcar hasta que estén espumosos. 3. Incorporar el chocolate derretido y la leche. 4. Agregar la harina tamizada con el polvo de hornear, mezclar suavemente. 5. Verter en molde enmantecado y enharinado. 6. Hornear a 180°C por 35 min. 7. Dejar enfriar, desmoldar y decorar con chocolate derretido.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '200g'}]->(harina)
CREATE (r)-[:CONTIENE {cantidad: '150g'}]->(azucar)
CREATE (r)-[:CONTIENE {cantidad: '200ml'}]->(leche)
CREATE (r)-[:CONTIENE {cantidad: '2 unidades'}]->(huevo)
CREATE (r)-[:CONTIENE {cantidad: '150g'}]->(chocolate)
CREATE (r)-[:CONTIENE {cantidad: '100g'}]->(manteca)
CREATE (r)-[:CONTIENE {cantidad: '1 cdita'}]->(levadura);

// ---------- 4.11 Lemon Pie (Postre - Ornella) ----------
MATCH (cat:Categoria {nombre: 'Postre'})
MATCH (user:Usuario {nombre: 'Ornella'})
MATCH (harina:Ingrediente {nombre: 'Harina'})
MATCH (manteca:Ingrediente {nombre: 'Manteca'})
MATCH (azucar:Ingrediente {nombre: 'Azúcar'})
MATCH (huevo:Ingrediente {nombre: 'Huevo'})
MATCH (limon:Ingrediente {nombre: 'Limón'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Lemon Pie',
  descripcion: 'Tarta clásica de limón con base crocante de masa dulce y abundante merengue italiano',
  dificultad: 'Media',
  tiempo: '50 min',
  imagen: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Arenar harina, manteca y azúcar. Agregar yemas y formar la masa. Refrigerar 30 min. 2. Estirar la masa en una tartera y hornear a 180°C por 15 min (a blanco). 3. Mezclar jugo de limón, ralladura, azúcar, yemas y almidón de maíz. Cocinar a fuego medio revolviendo hasta espesar. 4. Volcar la crema de limón sobre la masa cocida. 5. Preparar un merengue italiano batiendo claras a punto nieve e incorporando almíbar caliente. 6. Decorar la tarta con el merengue y sopletear.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '250g'}]->(harina)
CREATE (r)-[:CONTIENE {cantidad: '120g'}]->(manteca)
CREATE (r)-[:CONTIENE {cantidad: '150g'}]->(azucar)
CREATE (r)-[:CONTIENE {cantidad: '4 unidades'}]->(huevo)
CREATE (r)-[:CONTIENE {cantidad: '3 unidades'}]->(limon);

// ---------- 4.12 Risotto de Hongos (Vegetariano - Ana) ----------
MATCH (cat:Categoria {nombre: 'Vegetariano'})
MATCH (user:Usuario {nombre: 'Ana'})
MATCH (arroz:Ingrediente {nombre: 'Arroz Carnaroli'})
MATCH (hongos:Ingrediente {nombre: 'Hongos'})
MATCH (cebolla:Ingrediente {nombre: 'Cebolla'})
MATCH (ajo:Ingrediente {nombre: 'Ajo'})
MATCH (manteca:Ingrediente {nombre: 'Manteca'})
MATCH (queso:Ingrediente {nombre: 'Queso Parmesano'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Risotto de Hongos',
  descripcion: 'Risotto italiano cremoso con selección de hongos frescos, ideal para una cena elegante',
  dificultad: 'Alta',
  tiempo: '35 min',
  imagen: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Filetear los hongos y saltearlos en una sartén con manteca y ajo. Reservar. 2. Picar cebolla finamente y rehogar en manteca hasta transparentar. 3. Agregar el arroz Carnaroli y tostarlo por 2 min. 4. Agregar caldo caliente cucharada a cucharada, revolviendo continuamente. 5. A mitad de cocción (10 min), agregar los hongos. 6. Una vez al dente, apagar el fuego y mantecar con manteca fría y abundante queso parmesano.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '320g'}]->(arroz)
CREATE (r)-[:CONTIENE {cantidad: '250g'}]->(hongos)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(cebolla)
CREATE (r)-[:CONTIENE {cantidad: '1 diente'}]->(ajo)
CREATE (r)-[:CONTIENE {cantidad: '60g'}]->(manteca)
CREATE (r)-[:CONTIENE {cantidad: '80g'}]->(queso);

// ---------- 4.13 Pan de masa madre (Panadería - Martín) ----------
MATCH (cat:Categoria {nombre: 'Panadería'})
MATCH (user:Usuario {nombre: 'Martín'})
MATCH (harina:Ingrediente {nombre: 'Harina'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Pan de masa madre',
  descripcion: 'Pan artesanal de corteza crocante y miga abierta elaborado con fermento natural',
  dificultad: 'Alta',
  tiempo: '24 hs',
  imagen: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Mezclar harina y agua para autólisis (1 hora). 2. Agregar la masa madre activa y amasar. Añadir sal y amasar 5 min más. 3. Hacer pliegues cada 30 min durante 3 horas. 4. Preformar la pieza y dejar reposar 20 min. 5. Dar forma definitiva y colocar en banetón. 6. Fermentar en heladera por 16 horas. 7. Calentar olla de hierro a 250°C. 8. Hornear con tapa por 25 min y sin tapa por 20 min más.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '500g'}]->(harina)
CREATE (r)-[:CONTIENE {cantidad: '10g'}]->(sal);

// ---------- 4.14 Clásico Negroni (Bebidas - Sofía) ----------
MATCH (cat:Categoria {nombre: 'Bebidas'})
MATCH (user:Usuario {nombre: 'Sofía'})
MATCH (gin:Ingrediente {nombre: 'Ginebra'})
MATCH (campari:Ingrediente {nombre: 'Campari'})
MATCH (vermut:Ingrediente {nombre: 'Vermut Rojo'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Clásico Negroni',
  descripcion: 'El aperitivo italiano por excelencia: balance perfecto de amargor y dulzura',
  dificultad: 'Baja',
  tiempo: '5 min',
  imagen: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Enfriar un vaso Old Fashioned con abundante hielo. 2. Verter partes iguales de gin, Campari y vermut rojo en un vaso mezclador con hielo. 3. Remover suavemente por 15 segundos para diluir y enfriar. 4. Colar la mezcla en el vaso de servir con un gran cubo de hielo fresco. 5. Decorar con una rodaja de naranja fresca o piel de naranja.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '30ml'}]->(gin)
CREATE (r)-[:CONTIENE {cantidad: '30ml'}]->(campari)
CREATE (r)-[:CONTIENE {cantidad: '30ml'}]->(vermut);

// ---------- 4.15 Risotto al azafrán (Pastas - Carlos) ----------
MATCH (cat:Categoria {nombre: 'Pastas'})
MATCH (user:Usuario {nombre: 'Carlos'})
MATCH (arroz:Ingrediente {nombre: 'Arroz Carnaroli'})
MATCH (cebolla:Ingrediente {nombre: 'Cebolla'})
MATCH (azafran:Ingrediente {nombre: 'Azafrán'})
MATCH (manteca:Ingrediente {nombre: 'Manteca'})
MATCH (queso:Ingrediente {nombre: 'Queso Parmesano'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Risotto al azafrán',
  descripcion: 'Risotto alla Milanese tradicional, de sabor perfumado y un color dorado vibrante',
  dificultad: 'Media',
  tiempo: '30 min',
  imagen: 'https://images.unsplash.com/photo-1461009683693-342af2f2d6ce?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Infusionar las hebras de azafrán en una taza de caldo caliente. 2. Picar cebolla finamente y rehogar en manteca. 3. Añadir el arroz Carnaroli y tostar 2 min. 4. Incorporar caldo caliente lentamente a medida que se absorba. 5. Agregar la infusión de azafrán a los 10 min de cocción. 6. Cocinar hasta que esté al dente, apagar el fuego y mantecar vigorosamente con manteca fría y queso parmesano rallado.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '320g'}]->(arroz)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(cebolla)
CREATE (r)-[:CONTIENE {cantidad: '1 cdita'}]->(azafran)
CREATE (r)-[:CONTIENE {cantidad: '50g'}]->(manteca)
CREATE (r)-[:CONTIENE {cantidad: '60g'}]->(queso);

// ---------- 4.16 Pollo al verdeo (SIN TACC - Carlos) ----------
MATCH (cat:Categoria {nombre: 'SIN TACC'})
MATCH (user:Usuario {nombre: 'Carlos'})
MATCH (pollo:Ingrediente {nombre: 'Pollo'})
MATCH (verdeo:Ingrediente {nombre: 'Cebolla de Verdeo'})
MATCH (crema:Ingrediente {nombre: 'Crema de Leche'})
MATCH (aceite:Ingrediente {nombre: 'Aceite'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Pollo al verdeo',
  descripcion: 'Riquísimo pollo al verdeo con crema, un clásico de la cocina hogareña argentina',
  dificultad: 'Media',
  tiempo: '35 min',
  imagen: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Cortar el pollo en cubos medianos y salpimentar. 2. Picar la cebolla de verdeo, separando la parte blanca de la verde. 3. En una sartén con aceite, dorar los cubos de pollo. 4. Agregar la parte blanca del verdeo y rehogar. 5. Incorporar la crema de leche y cocinar a fuego bajo por 10 min. 6. Espolvorear con la parte verde del verdeo y servir.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '500g'}]->(pollo)
CREATE (r)-[:CONTIENE {cantidad: '3 unidades'}]->(verdeo)
CREATE (r)-[:CONTIENE {cantidad: '200ml'}]->(crema)
CREATE (r)-[:CONTIENE {cantidad: '2 cdas'}]->(aceite);

// ---------- 4.17 Hamburguesa clásica (Comida rápida - Carlos) ----------
MATCH (cat:Categoria {nombre: 'Comida rápida'})
MATCH (user:Usuario {nombre: 'Carlos'})
MATCH (carne:Ingrediente {nombre: 'Carne de Res'})
MATCH (pan:Ingrediente {nombre: 'Pan de Hamburguesa'})
MATCH (cheddar:Ingrediente {nombre: 'Queso Cheddar'})
MATCH (lechuga:Ingrediente {nombre: 'Lechuga'})
MATCH (tomate:Ingrediente {nombre: 'Tomate'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
MATCH (aceite:Ingrediente {nombre: 'Aceite'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Hamburguesa clásica',
  descripcion: 'Hamburguesa casera doble carne con queso cheddar fundido, lechuga, tomate y aderezo especial en pan brioche',
  dificultad: 'Baja',
  tiempo: '20 min',
  imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Formar dos bollos de carne picada de 100g y aplastarlos en la plancha caliente (smash). 2. Salpimentar al gusto. 3. Dar vuelta y colocar una rodaja de queso cheddar sobre cada carne. 4. Tostar el pan de hamburguesa con manteca. 5. Armar colocando la salsa, lechuga, tomate, las dos carnes con queso y tapar.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '200g'}]->(carne)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(pan)
CREATE (r)-[:CONTIENE {cantidad: '2 fetas'}]->(cheddar)
CREATE (r)-[:CONTIENE {cantidad: '1 hoja'}]->(lechuga)
CREATE (r)-[:CONTIENE {cantidad: '1 rodaja'}]->(tomate)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal)
CREATE (r)-[:CONTIENE {cantidad: '1 cda'}]->(aceite);

// ---------- 4.18 Tacos de carne (Comida rápida - Ana) ----------
MATCH (cat:Categoria {nombre: 'Comida rápida'})
MATCH (user:Usuario {nombre: 'Ana'})
MATCH (carne:Ingrediente {nombre: 'Carne de Res'})
MATCH (tortilla:Ingrediente {nombre: 'Tortillas de Maíz'})
MATCH (cebolla:Ingrediente {nombre: 'Cebolla'})
MATCH (cilantro:Ingrediente {nombre: 'Cilantro'})
MATCH (limon:Ingrediente {nombre: 'Limón'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
MATCH (aceite:Ingrediente {nombre: 'Aceite'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Tacos de carne',
  descripcion: 'Tacos mexicanos tradicionales con carne de res salteada con especias, cebolla, cilantro fresco y limón',
  dificultad: 'Media',
  tiempo: '25 min',
  imagen: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Cortar la carne en trozos pequeños y dorar en una sartén con aceite. 2. Picar la cebolla y el cilantro finamente. 3. Calentar las tortillas de maíz en una plancha. 4. Armar los tacos colocando la carne sobre las tortillas calientes. 5. Decorar con cebolla, cilantro y acompañar con gajos de limón.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '300g'}]->(carne)
CREATE (r)-[:CONTIENE {cantidad: '4 unidades'}]->(tortilla)
CREATE (r)-[:CONTIENE {cantidad: '1/2 unidad'}]->(cebolla)
CREATE (r)-[:CONTIENE {cantidad: '1 puñado'}]->(cilantro)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(limon)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal)
CREATE (r)-[:CONTIENE {cantidad: '1 cda'}]->(aceite);

// ---------- 4.19 Fernet con cola (Bebidas - Juan) ----------
MATCH (cat:Categoria {nombre: 'Bebidas'})
MATCH (user:Usuario {nombre: 'Juan'})
MATCH (fernet:Ingrediente {nombre: 'Fernet'})
MATCH (cola:Ingrediente {nombre: 'Bebida de Cola'})
MATCH (hielo:Ingrediente {nombre: 'Hielo'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Fernet con cola',
  descripcion: 'El trago clásico y popular de Argentina, la combinación perfecta de hierbas amargas y dulzura cola',
  dificultad: 'Baja',
  tiempo: '5 min',
  imagen: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Fernet_con_coca.jpg',
  pasos: '1. Llenar un vaso de trago largo con abundante hielo hasta el borde. 2. Servir el Fernet lentamente (aproximadamente un 30% del vaso). 3. Completar el vaso con la bebida de cola bien fría, inclinando el vaso levemente. 4. Dejar que se forme la clásica espuma densa en el tope. Revolver suavemente una vez.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '150ml'}]->(fernet)
CREATE (r)-[:CONTIENE {cantidad: '350ml'}]->(cola)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(hielo);

// ---------- 4.20 Asado de tira (Carnes - Carlos) ----------
MATCH (cat:Categoria {nombre: 'Carnes'})
MATCH (user:Usuario {nombre: 'Carlos'})
MATCH (asado:Ingrediente {nombre: 'Tira de Asado'})
MATCH (sal:Ingrediente {nombre: 'Sal Gruesa'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Asado de tira',
  descripcion: 'Asado de tira tradicional argentino cocinado lentamente a la parrilla, con corteza crocante y carne jugosa',
  dificultad: 'Alta',
  tiempo: '90 min',
  imagen: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Asado_2005.jpg',
  pasos: '1. Preparar las brasas a partir de carbón o leña. 2. Salar la tira de asado uniformemente con sal gruesa. 3. Colocar en la parrilla bien caliente sobre brasas medias, siempre del lado del hueso primero. 4. Cocinar durante 50-60 min del lado del hueso. 5. Dar vuelta y cocinar del lado de la carne durante 20-30 min más hasta el punto deseado.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '1kg'}]->(asado)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal);

// ---------- 4.21 Lomito completo (Carnes - Juan) ----------
MATCH (cat:Categoria {nombre: 'Carnes'})
MATCH (user:Usuario {nombre: 'Juan'})
MATCH (lomo:Ingrediente {nombre: 'Lomo'})
MATCH (pan:Ingrediente {nombre: 'Pan de Hamburguesa'})
MATCH (jamon:Ingrediente {nombre: 'Jamón Cocido'})
MATCH (queso:Ingrediente {nombre: 'Queso Parmesano'})
MATCH (lechuga:Ingrediente {nombre: 'Lechuga'})
MATCH (tomate:Ingrediente {nombre: 'Tomate'})
MATCH (huevo:Ingrediente {nombre: 'Huevo'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
MATCH (aceite:Ingrediente {nombre: 'Aceite'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Lomito completo',
  descripcion: 'El clásico sándwich de lomito cordobés completo, con filete de lomo tierno, jamón, queso, huevo frito y verduras',
  dificultad: 'Media',
  tiempo: '30 min',
  imagen: 'https://upload.wikimedia.org/wikipedia/commons/f/fd/Lomito_de_Mendoza.jpg',
  pasos: '1. Cortar el lomo en filetes delgados y tiernizar golpeándolos suavemente. 2. Cocinar el lomo en una plancha caliente con aceite y salar. 3. Agregar sobre el lomo caliente una feta de jamón y una de queso para que se derrita. 4. Cocinar un huevo frito a la plancha. 5. Tostar el pan y armar el sándwich con mayonesa, lechuga, tomate, el lomo gratinado y el huevo frito.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '200g'}]->(lomo)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(pan)
CREATE (r)-[:CONTIENE {cantidad: '1 feta'}]->(jamon)
CREATE (r)-[:CONTIENE {cantidad: '1 feta'}]->(queso)
CREATE (r)-[:CONTIENE {cantidad: '1 hoja'}]->(lechuga)
CREATE (r)-[:CONTIENE {cantidad: '1 rodaja'}]->(tomate)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(huevo)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal)
CREATE (r)-[:CONTIENE {cantidad: '1 cda'}]->(aceite);

// ---------- 4.22 Milanesa con papas fritas (Minutas - Ornella) ----------
MATCH (cat:Categoria {nombre: 'Minutas'})
MATCH (user:Usuario {nombre: 'Ornella'})
MATCH (carne:Ingrediente {nombre: 'Carne Vacuna'})
MATCH (huevo:Ingrediente {nombre: 'Huevo'})
MATCH (panRallado:Ingrediente {nombre: 'Pan Rallado'})
MATCH (ajo:Ingrediente {nombre: 'Ajo'})
MATCH (perejil:Ingrediente {nombre: 'Perejil'})
MATCH (papa:Ingrediente {nombre: 'Papa'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
MATCH (aceite:Ingrediente {nombre: 'Aceite'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Milanesa con papas fritas',
  descripcion: 'Milanesa clásica de carne vacuna, crocante y dorada por fuera, servida con bastones de papas fritas crujientes',
  dificultad: 'Media',
  tiempo: '45 min',
  imagen: 'https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Limpiar la carne y cortar en filetes. Aplanar si es necesario. 2. Mezclar huevos batiendo con ajo picado, perejil y sal. 3. Pasar la carne por el huevo y luego empanar con pan rallado presionando fuerte. 4. Cortar las papas en bastones y freír en abundante aceite caliente hasta dorar. 5. Freír la milanesa en aceite caliente por 2-3 min por lado y servir junto a las papas fritas.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '300g'}]->(carne)
CREATE (r)-[:CONTIENE {cantidad: '2 unidades'}]->(huevo)
CREATE (r)-[:CONTIENE {cantidad: '200g'}]->(panRallado)
CREATE (r)-[:CONTIENE {cantidad: '2 dientes'}]->(ajo)
CREATE (r)-[:CONTIENE {cantidad: '1 cda'}]->(perejil)
CREATE (r)-[:CONTIENE {cantidad: '3 unidades'}]->(papa)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(aceite);

// ---------- 4.23 Empanadas de carne (Minutas - Ana) ----------
MATCH (cat:Categoria {nombre: 'Minutas'})
MATCH (user:Usuario {nombre: 'Ana'})
MATCH (carne:Ingrediente {nombre: 'Carne Vacuna'})
MATCH (cebolla:Ingrediente {nombre: 'Cebolla'})
MATCH (huevo:Ingrediente {nombre: 'Huevo'})
MATCH (harina:Ingrediente {nombre: 'Harina'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
MATCH (aceite:Ingrediente {nombre: 'Aceite'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Empanadas de carne',
  descripcion: 'Empanadas criollas tradicionales horneadas con relleno de carne picada jugosa, cebolla, condimentos y huevo duro',
  dificultad: 'Alta',
  tiempo: '60 min',
  imagen: 'https://images.unsplash.com/photo-1608039783021-6116a558f0c5?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Picar la cebolla y rehogarla en una olla con aceite. 2. Añadir la carne picada y cocinar hasta sellar. Condimentar con sal, comino y pimentón. Dejar enfriar el relleno. 3. Añadir huevo duro picado al relleno. 4. Colocar una cucharada de relleno en cada disco de masa para empanada hecho con harina. 5. Cerrar haciendo el clásico repulgue. 6. Hornear a 220°C por 15 min hasta que estén doradas.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '400g'}]->(carne)
CREATE (r)-[:CONTIENE {cantidad: '2 unidades'}]->(cebolla)
CREATE (r)-[:CONTIENE {cantidad: '2 unidades'}]->(huevo)
CREATE (r)-[:CONTIENE {cantidad: '12 discos'}]->(harina)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal)
CREATE (r)-[:CONTIENE {cantidad: '2 cdas'}]->(aceite);

// ---------- 4.24 Medialunas de manteca (Panadería - Ana) ----------
MATCH (cat:Categoria {nombre: 'Panadería'})
MATCH (user:Usuario {nombre: 'Ana'})
MATCH (harina:Ingrediente {nombre: 'Harina'})
MATCH (manteca:Ingrediente {nombre: 'Manteca'})
MATCH (leche:Ingrediente {nombre: 'Leche'})
MATCH (azucar:Ingrediente {nombre: 'Azúcar'})
MATCH (levadura:Ingrediente {nombre: 'Levadura'})
MATCH (huevo:Ingrediente {nombre: 'Huevo'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Medialunas de manteca',
  descripcion: 'Facturas de hojaldre dulces clásicas de la panadería argentina, pintadas con almíbar brillante',
  dificultad: 'Alta',
  tiempo: '120 min',
  imagen: 'https://images.unsplash.com/photo-1623334044303-241021148842?w=800&auto=format&fit=crop&q=60',
  pasos: '1. Hacer una masa con harina, leche, azúcar y levadura. Dejar fermentar. 2. Empastar con manteca fría y realizar dobleces para lograr el hojaldre. 3. Estirar la masa y cortar triángulos. 4. Enrollar desde la base para dar la forma de medialuna doblando las puntas. 5. Dejar leudar en placa, pintar con huevo batido y hornear a 200°C por 15 min. 6. Al salir del horno, pintar generosamente con almíbar.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '500g'}]->(harina)
CREATE (r)-[:CONTIENE {cantidad: '200g'}]->(manteca)
CREATE (r)-[:CONTIENE {cantidad: '150ml'}]->(leche)
CREATE (r)-[:CONTIENE {cantidad: '100g'}]->(azucar)
CREATE (r)-[:CONTIENE {cantidad: '25g'}]->(levadura)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(huevo);


// ============================================================
// 5. FAVORITOS (GUARDO_FAV)
// ============================================================

// Ornella guarda: Guiso de lentejas, Pizza margherita, Flan casero, Risotto al azafrán, Hamburguesa clásica, Milanesa con papas fritas, Medialunas de manteca, Clásico Negroni
MATCH (u:Usuario {nombre: 'Ornella'}), (r:Receta {titulo: 'Guiso de lentejas'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ornella'}), (r:Receta {titulo: 'Pizza margherita'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ornella'}), (r:Receta {titulo: 'Flan casero'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ornella'}), (r:Receta {titulo: 'Risotto al azafrán'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ornella'}), (r:Receta {titulo: 'Hamburguesa clásica'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ornella'}), (r:Receta {titulo: 'Milanesa con papas fritas'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ornella'}), (r:Receta {titulo: 'Medialunas de manteca'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ornella'}), (r:Receta {titulo: 'Clásico Negroni'}) CREATE (u)-[:GUARDO_FAV]->(r);

// Juan guarda: Torta de chocolate, Wok de verduras con pollo, Pan de masa madre, Asado de tira, Fernet con cola, Medialunas de manteca
MATCH (u:Usuario {nombre: 'Juan'}), (r:Receta {titulo: 'Torta de chocolate'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Juan'}), (r:Receta {titulo: 'Wok de verduras con pollo'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Juan'}), (r:Receta {titulo: 'Pan de masa madre'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Juan'}), (r:Receta {titulo: 'Asado de tira'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Juan'}), (r:Receta {titulo: 'Fernet con cola'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Juan'}), (r:Receta {titulo: 'Medialunas de manteca'}) CREATE (u)-[:GUARDO_FAV]->(r);

// Ana guarda: Ensalada primavera, Ñoquis de papa, Guacamole con nachos, Tallarines con bolognesa, Clásico Negroni, Lomito completo, Medialunas de manteca
MATCH (u:Usuario {nombre: 'Ana'}), (r:Receta {titulo: 'Ensalada primavera'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ana'}), (r:Receta {titulo: 'Ñoquis de papa'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ana'}), (r:Receta {titulo: 'Guacamole con nachos'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ana'}), (r:Receta {titulo: 'Tallarines con bolognesa'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ana'}), (r:Receta {titulo: 'Clásico Negroni'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ana'}), (r:Receta {titulo: 'Lomito completo'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ana'}), (r:Receta {titulo: 'Medialunas de manteca'}) CREATE (u)-[:GUARDO_FAV]->(r);

// Carlos guarda: Tacos de carne, Empanadas de carne
MATCH (u:Usuario {nombre: 'Carlos'}), (r:Receta {titulo: 'Tacos de carne'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Carlos'}), (r:Receta {titulo: 'Empanadas de carne'}) CREATE (u)-[:GUARDO_FAV]->(r);

// ============================================================
// 6. RELACIONES DE SEGUIMIENTO (SIGUE)
// ============================================================

MATCH (u1:Usuario {nombre: 'Ornella'}), (u2:Usuario {nombre: 'Juan'}) CREATE (u1)-[:SIGUE]->(u2);
MATCH (u1:Usuario {nombre: 'Ornella'}), (u2:Usuario {nombre: 'Ana'}) CREATE (u1)-[:SIGUE]->(u2);
MATCH (u1:Usuario {nombre: 'Ornella'}), (u2:Usuario {nombre: 'Martín'}) CREATE (u1)-[:SIGUE]->(u2);

MATCH (u1:Usuario {nombre: 'Juan'}), (u2:Usuario {nombre: 'Ornella'}) CREATE (u1)-[:SIGUE]->(u2);
MATCH (u1:Usuario {nombre: 'Juan'}), (u2:Usuario {nombre: 'Carlos'}) CREATE (u1)-[:SIGUE]->(u2);

MATCH (u1:Usuario {nombre: 'Ana'}), (u2:Usuario {nombre: 'Ornella'}) CREATE (u1)-[:SIGUE]->(u2);
MATCH (u1:Usuario {nombre: 'Ana'}), (u2:Usuario {nombre: 'Sofía'}) CREATE (u1)-[:SIGUE]->(u2);

MATCH (u1:Usuario {nombre: 'Martín'}), (u2:Usuario {nombre: 'Ornella'}) CREATE (u1)-[:SIGUE]->(u2);
MATCH (u1:Usuario {nombre: 'Martín'}), (u2:Usuario {nombre: 'Juan'}) CREATE (u1)-[:SIGUE]->(u2);

MATCH (u1:Usuario {nombre: 'Sofía'}), (u2:Usuario {nombre: 'Juan'}) CREATE (u1)-[:SIGUE]->(u2);
MATCH (u1:Usuario {nombre: 'Sofía'}), (u2:Usuario {nombre: 'Carlos'}) CREATE (u1)-[:SIGUE]->(u2);

MATCH (u1:Usuario {nombre: 'Carlos'}), (u2:Usuario {nombre: 'Ornella'}) CREATE (u1)-[:SIGUE]->(u2);
MATCH (u1:Usuario {nombre: 'Carlos'}), (u2:Usuario {nombre: 'Ana'}) CREATE (u1)-[:SIGUE]->(u2);
