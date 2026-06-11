// ============================================================
// SCRIPT DE POBLADO - BASE DE DATOS DE RECETAS
// ============================================================

// ---- LIMPIAR DATOS EXISTENTES (opcional) ----
// MATCH (n) DETACH DELETE n;

// ============================================================
// 1. CATEGORIAS
// ============================================================
CREATE (c1:Categoria {nombre: 'SIN TACC'})
CREATE (c2:Categoria {nombre: 'Vegetariano'})
CREATE (c3:Categoria {nombre: 'Vegano'})
CREATE (c4:Categoria {nombre: 'Pastas'})
CREATE (c5:Categoria {nombre: 'Postre'});

// ============================================================
// 2. USUARIOS
// ============================================================
CREATE (u1:Usuario {nombre: 'Ornella', mail: 'ornella@mail.com', contrasena: 'pass123'})
CREATE (u2:Usuario {nombre: 'Juan', mail: 'juan@mail.com', contrasena: 'pass456'})
CREATE (u3:Usuario {nombre: 'Ana', mail: 'ana@mail.com', contrasena: 'pass789'});

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
MERGE (i39:Ingrediente {nombre: 'Queso Parmesano'});

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

// ---------- 4.4 Milanesa de berenjena (Vegetariano) ----------
MATCH (cat:Categoria {nombre: 'Vegetariano'})
MATCH (user:Usuario {nombre: 'Ana'})
MATCH (berenjena:Ingrediente {nombre: 'Berenjena'})
MATCH (huevo:Ingrediente {nombre: 'Huevo'})
MATCH (panRallado:Ingrediente {nombre: 'Pan Rallado'})
MATCH (salsa:Ingrediente {nombre: 'Salsa de Tomate'})
MATCH (muzza:Ingrediente {nombre: 'Queso Muzzarella'})
MATCH (sal:Ingrediente {nombre: 'Sal'})
MATCH (aceite:Ingrediente {nombre: 'Aceite'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Milanesa de berenjena',
  descripcion: 'Milanesa vegetariana de berenjena gratinada con salsa y queso',
  dificultad: 'Media',
  tiempo: '35 min',
  pasos: '1. Cortar las berenjenas en rodajas de 1cm y salarlas para que larguen el amargo (15 min). 2. Secar las rodajas, pasar por huevo batido y pan rallado. 3. Freír en aceite caliente hasta dorar ambos lados. 4. Colocar en una placa, cubrir con salsa de tomate y queso muzzarella. 5. Gratinar en horno por 5 min hasta que el queso se derrita.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '2 unidades'}]->(berenjena)
CREATE (r)-[:CONTIENE {cantidad: '2 unidades'}]->(huevo)
CREATE (r)-[:CONTIENE {cantidad: '200g'}]->(panRallado)
CREATE (r)-[:CONTIENE {cantidad: '150ml'}]->(salsa)
CREATE (r)-[:CONTIENE {cantidad: '150g'}]->(muzza)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal)
CREATE (r)-[:CONTIENE {cantidad: 'para freir'}]->(aceite);

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
MATCH (manteca:Ingrediente {nombre: 'Manteca'})
MATCH (queso:Ingrediente {nombre: 'Queso Parmesano'})
CREATE (r:Receta {
  id: randomUUID(),
  titulo: 'Ñoquis de papa',
  descripcion: 'Ñoquis caseros de papa con manteca y salvia, un clásico de la cocina italiana',
  dificultad: 'Alta',
  tiempo: '60 min',
  pasos: '1. Hervir las papas con cáscara hasta que estén tiernas. 2. Pelar y hacer un puré, dejar enfriar. 3. Agregar harina, huevo y sal, amasar hasta formar una masa suave. 4. Formar cilindros y cortar en cubitos. 5. Marcar con tenedor si se desea. 6. Cocinar en agua hirviendo con sal hasta que floten (2-3 min). 7. Servir con manteca derretida y queso parmesano.'
})
CREATE (user)-[:CREO]->(r)
CREATE (r)-[:PERTENECE_A]->(cat)
CREATE (r)-[:CONTIENE {cantidad: '1kg'}]->(papa)
CREATE (r)-[:CONTIENE {cantidad: '300g'}]->(harina)
CREATE (r)-[:CONTIENE {cantidad: '1 unidad'}]->(huevo)
CREATE (r)-[:CONTIENE {cantidad: 'c/n'}]->(sal)
CREATE (r)-[:CONTIENE {cantidad: '50g'}]->(manteca)
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
  descripcion: 'Flan cremoso y suave, el postre clásico argentino con caramelo',
  dificultad: 'Baja',
  tiempo: '90 min',
  pasos: '1. Preparar el caramelo: derretir azúcar en una sartén hasta que tome color ámbar y volcar en el molde. 2. Mezclar leche, huevos, azúcar y esencia de vainilla. Batir suavemente sin generar espuma. 3. Verter la mezcla en el molde acaramelado. 4. Cocinar al baño María en horno a 160°C por 60 min. 5. Dejar enfriar y refrigerar por al menos 4 horas. 6. Desmoldar y servir.'
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

// ============================================================
// 5. FAVORITOS (GUARDO_FAV)
// ============================================================

// Ornella guarda: Guiso de lentejas, Pizza margherita, Flan casero
MATCH (u:Usuario {nombre: 'Ornella'}), (r:Receta {titulo: 'Guiso de lentejas'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ornella'}), (r:Receta {titulo: 'Pizza margherita'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ornella'}), (r:Receta {titulo: 'Flan casero'}) CREATE (u)-[:GUARDO_FAV]->(r);

// Juan guarda: Milanesa de berenjena, Torta de chocolate, Wok de verduras con pollo
MATCH (u:Usuario {nombre: 'Juan'}), (r:Receta {titulo: 'Milanesa de berenjena'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Juan'}), (r:Receta {titulo: 'Torta de chocolate'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Juan'}), (r:Receta {titulo: 'Wok de verduras con pollo'}) CREATE (u)-[:GUARDO_FAV]->(r);

// Ana guarda: Ensalada primavera, Ñoquis de papa, Guacamole con nachos, Tallarines con bolognesa
MATCH (u:Usuario {nombre: 'Ana'}), (r:Receta {titulo: 'Ensalada primavera'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ana'}), (r:Receta {titulo: 'Ñoquis de papa'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ana'}), (r:Receta {titulo: 'Guacamole con nachos'}) CREATE (u)-[:GUARDO_FAV]->(r);
MATCH (u:Usuario {nombre: 'Ana'}), (r:Receta {titulo: 'Tallarines con bolognesa'}) CREATE (u)-[:GUARDO_FAV]->(r);
