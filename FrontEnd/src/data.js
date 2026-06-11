/* Seed data — replicates poblar_recetario.cypher exactly so the front works standalone. */
window.SEED = (() => {
  const categorias = ['SIN TACC', 'Vegetariano', 'Vegano', 'Pastas', 'Postre', 'Comida rápida', 'Bebidas', 'Carnes', 'Minutas', 'Panadería'];

  const usuarios = [
    { nombre: 'Ornella', mail: 'ornella@mail.com', contrasena: 'pass123' },
    { nombre: 'Juan', mail: 'juan@mail.com', contrasena: 'pass456' },
    { nombre: 'Ana', mail: 'ana@mail.com', contrasena: 'pass789' },
  ];

  // shorthand: r(titulo, descripcion, dificultad, tiempo, creador, categoria, pasos, ings)
  // ings = [[nombre, cantidad], ...]
  const recetas = [
    {
      titulo: 'Guiso de lentejas', creador: 'Ornella', categoria: 'SIN TACC',
      descripcion: 'Un guiso reconfortante de lentejas con verduras, perfecto para días fríos.',
      dificultad: 'Alta', tiempo: '60 min',
      pasos: '1. Remojar las lentejas la noche anterior. 2. Picar cebolla, ajo, zanahoria y pimiento en cubos. 3. Rehogar las verduras en aceite hasta que estén tiernas. 4. Agregar las lentejas escurridas, cubrir con agua y añadir laurel. 5. Cocinar a fuego medio por 40 min revolviendo ocasionalmente. 6. Salpimentar a gusto y servir caliente.',
      ingredientes: [['Lentejas','400g'],['Cebolla','1 unidad'],['Zanahoria','2 unidades'],['Ajo','2 dientes'],['Pimiento','1 unidad'],['Sal','c/n'],['Pimienta','c/n'],['Aceite','3 cdas'],['Laurel','1 hoja']],
    },
    {
      titulo: 'Wok de verduras con pollo', creador: 'Ornella', categoria: 'SIN TACC',
      descripcion: 'Salteado rápido de pollo y verduras con noodles de arroz, libre de gluten.',
      dificultad: 'Media', tiempo: '25 min',
      pasos: '1. Cortar el pollo en tiras finas y salpimentar. 2. Picar todas las verduras en juliana. 3. Hidratar los noodles de arroz en agua caliente por 5 min y escurrir. 4. Saltear el pollo en el wok con aceite hasta dorar, reservar. 5. Saltear las verduras con jengibre rallado por 3 min. 6. Agregar el pollo, los noodles y la salsa de soja. 7. Saltear todo junto por 2 min y servir.',
      ingredientes: [['Pollo','300g'],['Brócoli','1 taza'],['Zanahoria','1 unidad'],['Pimiento','1 unidad'],['Cebolla','1/2 unidad'],['Jengibre','1 cdita'],['Salsa de Soja','3 cdas'],['Aceite','2 cdas'],['Noodles de Arroz','200g'],['Sal','c/n']],
    },
    {
      titulo: 'Pizza margherita', creador: 'Juan', categoria: 'Vegetariano',
      descripcion: 'Pizza italiana clásica con salsa de tomate, muzzarella y albahaca fresca.',
      dificultad: 'Media', tiempo: '45 min',
      pasos: '1. Mezclar harina, levadura, sal y agua tibia. Amasar por 10 min hasta obtener masa lisa. 2. Dejar reposar tapada por 20 min. 3. Estirar la masa en forma circular. 4. Cubrir con salsa de tomate, muzzarella en cubos y orégano. 5. Hornear a 220°C por 15 min. 6. Agregar albahaca fresca al salir del horno.',
      ingredientes: [['Harina','500g'],['Salsa de Tomate','200ml'],['Queso Muzzarella','200g'],['Albahaca','2 ramitas'],['Sal','c/n'],['Aceite','2 cdas'],['Levadura','25g'],['Orégano','c/n']],
    },
    {
      titulo: 'Milanesa de berenjena', creador: 'Ana', categoria: 'Vegetariano',
      descripcion: 'Milanesa vegetariana de berenjena gratinada con salsa y queso.',
      dificultad: 'Media', tiempo: '35 min',
      pasos: '1. Cortar las berenjenas en rodajas de 1cm y salarlas para que larguen el amargo (15 min). 2. Secar las rodajas, pasar por huevo batido y pan rallado. 3. Freír en aceite caliente hasta dorar ambos lados. 4. Colocar en una placa, cubrir con salsa de tomate y queso muzzarella. 5. Gratinar en horno por 5 min hasta que el queso se derrita.',
      ingredientes: [['Berenjena','2 unidades'],['Huevo','2 unidades'],['Pan Rallado','200g'],['Salsa de Tomate','150ml'],['Queso Muzzarella','150g'],['Sal','c/n'],['Aceite','para freir']],
    },
    {
      titulo: 'Guacamole con nachos', creador: 'Ana', categoria: 'Vegano',
      descripcion: 'Dip cremoso de palta con tomate y cilantro, acompañado de nachos crujientes.',
      dificultad: 'Baja', tiempo: '10 min',
      pasos: '1. Cortar las paltas por la mitad, retirar el carozo y pisar la pulpa con un tenedor. 2. Picar el tomate, la cebolla y el cilantro finamente. 3. Mezclar todo con la palta pisada. 4. Agregar jugo de limón y sal a gusto. 5. Servir inmediatamente con nachos.',
      ingredientes: [['Palta','2 unidades'],['Tomate','1 unidad'],['Cebolla','1/4 unidad'],['Cilantro','1 puñado'],['Limón','1 unidad'],['Sal','c/n'],['Nachos','1 bolsa']],
    },
    {
      titulo: 'Ensalada primavera', creador: 'Ornella', categoria: 'Vegano',
      descripcion: 'Ensalada fresca y colorida con verduras de estación, aliño cítrico.',
      dificultad: 'Baja', tiempo: '15 min',
      pasos: '1. Lavar y cortar la lechuga en trozos. 2. Cortar el tomate en cubos y la zanahoria en juliana. 3. Cortar la cebolla en aros finos. 4. Mezclar todas las verduras en un bowl. 5. Aliñar con aceite, jugo de limón y sal a gusto. 6. Mezclar bien y servir fría.',
      ingredientes: [['Lechuga','1 planta'],['Tomate','2 unidades'],['Zanahoria','1 unidad'],['Cebolla','1/2 unidad'],['Aceite','3 cdas'],['Limón','1 unidad'],['Sal','c/n']],
    },
    {
      titulo: 'Tallarines con bolognesa', creador: 'Juan', categoria: 'Pastas',
      descripcion: 'Clásica pasta italiana con salsa bolognesa casera y queso parmesano.',
      dificultad: 'Media', tiempo: '40 min',
      pasos: '1. Picar cebolla y ajo finamente y rehogar en aceite. 2. Agregar la carne picada y cocinar hasta que se dore. 3. Incorporar la salsa de tomate, sal y pimienta. 4. Cocinar la salsa a fuego bajo por 20 min. 5. Hervir los tallarines en agua con sal hasta que estén al dente. 6. Servir la salsa sobre los tallarines y espolvorear con parmesano.',
      ingredientes: [['Fideos','400g'],['Carne Picada','300g'],['Salsa de Tomate','300ml'],['Cebolla','1 unidad'],['Ajo','2 dientes'],['Aceite','2 cdas'],['Sal','c/n'],['Pimienta','c/n'],['Queso Parmesano','50g']],
    },
    {
      titulo: 'Ñoquis de papa', creador: 'Ana', categoria: 'Pastas',
      descripcion: 'Ñoquis caseros de papa con manteca y salvia, un clásico de la cocina italiana.',
      dificultad: 'Alta', tiempo: '60 min',
      pasos: '1. Hervir las papas con cáscara hasta que estén tiernas. 2. Pelar y hacer un puré, dejar enfriar. 3. Agregar harina, huevo y sal, amasar hasta formar una masa suave. 4. Formar cilindros y cortar en cubitos. 5. Marcar con tenedor si se desea. 6. Cocinar en agua hirviendo con sal hasta que floten (2-3 min). 7. Servir con manteca derretida y queso parmesano.',
      ingredientes: [['Papa','1kg'],['Harina','300g'],['Huevo','1 unidad'],['Sal','c/n'],['Manteca','50g'],['Queso Parmesano','c/n']],
    },
    {
      titulo: 'Flan casero', creador: 'Ornella', categoria: 'Postre',
      descripcion: 'Flan cremoso y suave, el postre clásico argentino con caramelo.',
      dificultad: 'Baja', tiempo: '90 min',
      pasos: '1. Preparar el caramelo: derretir azúcar en una sartén hasta que tome color ámbar y volcar en el molde. 2. Mezclar leche, huevos, azúcar y esencia de vainilla. Batir suavemente sin generar espuma. 3. Verter la mezcla en el molde acaramelado. 4. Cocinar al baño María en horno a 160°C por 60 min. 5. Dejar enfriar y refrigerar por al menos 4 horas. 6. Desmoldar y servir.',
      ingredientes: [['Leche','500ml'],['Huevo','4 unidades'],['Azúcar','200g'],['Esencia de Vainilla','1 cdita']],
    },
    {
      titulo: 'Torta de chocolate', creador: 'Juan', categoria: 'Postre',
      descripcion: 'Torta húmeda y esponjosa de chocolate, ideal para cualquier ocasión.',
      dificultad: 'Media', tiempo: '50 min',
      pasos: '1. Derretir el chocolate con la manteca a baño María. 2. Batir los huevos con el azúcar hasta que estén espumosos. 3. Incorporar el chocolate derretido y la leche. 4. Agregar la harina tamizada con el polvo de hornear, mezclar suavemente. 5. Verter en molde enmantecado y enharinado. 6. Hornear a 180°C por 35 min. 7. Dejar enfriar, desmoldar y decorar con chocolate derretido.',
      ingredientes: [['Harina','200g'],['Azúcar','150g'],['Leche','200ml'],['Huevo','2 unidades'],['Chocolate','150g'],['Manteca','100g'],['Polvo de Hornear','1 cdita']],
    },
  ];

  const favoritos = [
    ['Ornella', 'Guiso de lentejas'],
    ['Ornella', 'Pizza margherita'],
    ['Ornella', 'Flan casero'],
    ['Juan', 'Milanesa de berenjena'],
    ['Juan', 'Torta de chocolate'],
    ['Juan', 'Wok de verduras con pollo'],
    ['Ana', 'Ensalada primavera'],
    ['Ana', 'Ñoquis de papa'],
    ['Ana', 'Guacamole con nachos'],
    ['Ana', 'Tallarines con bolognesa'],
  ];

  return { categorias, usuarios, recetas, favoritos };
})();
