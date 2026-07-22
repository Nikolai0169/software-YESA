from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from pathlib import Path

root = Path(r"c:\Users\joser\OneDrive\Documentos\GitHub\software-YESA")
out_path = root / "Docs" / "documentacion final" / "Manual_Usuario_YESA.docx"

# Crear documento nuevo con estructura clara para Word

doc = Document()


def add_step_list(doc, items):
    for index, item in enumerate(items, 1):
        p = doc.add_paragraph(style="List Bullet")
        p.add_run(f"Paso {index}: {item}")


# Título
p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("Manual de Usuario\nSistema YESA")
run.bold = True
run.font.size = 24

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("Guía clara, sencilla y paso a paso para usar YESA")
run.italic = True
run.font.size = 12

p = doc.add_paragraph()
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = p.add_run("Versión 1.2 · Fecha 2026 · Elaborado para usuarios sin conocimientos técnicos")
run.italic = True
run.font.size = 11

doc.add_paragraph()

# Sección 1 - Introducción
doc.add_heading("1. Introducción", level=1)
p = doc.add_paragraph()
p.add_run("YESA es una plataforma pensada para que cualquier persona pueda comprar productos, crear diseños personalizados y gestionar pedidos de manera sencilla. Aunque el sistema tiene funciones avanzadas, su uso está explicado de forma práctica para que una persona sin experiencia técnica pueda seguirlo sin dificultad.")

p = doc.add_paragraph()
p.add_run("Este manual explica cada función como si se estuviera enseñando por primera vez. Se describe qué hacer, en qué lugar hacerlo, y qué resultado esperar después de cada acción.")

# Sección 2 - Cómo leer este manual
doc.add_heading("2. Cómo leer este manual", level=1)
p = doc.add_paragraph()
p.add_run("Cada sección del manual presenta una actividad concreta. Las instrucciones aparecen en formato paso a paso para que resulte más fácil seguirlas. Si usted está usando el sistema por primera vez, se recomienda leer las secciones en orden.")

add_step_list(doc, [
    "Lea primero la sección de registro e inicio de sesión para poder entrar al sistema.",
    "Luego revise la sección de catálogo para entender cómo buscar y elegir productos.",
    "Después siga la guía de compra y personalización para realizar una acción completa.",
    "Si algo no funciona, consulte la sección de solución de problemas al final.",
])

# Sección 3 - Funcionalidades principales del sistema
doc.add_heading("3. Funcionalidades principales del sistema", level=1)
p = doc.add_paragraph()
p.add_run("La documentación del proyecto muestra que YESA está pensado como una tienda online completa. No solo permite comprar, sino también administrar productos, controlar usuarios, gestionar pedidos y usar funciones de personalización. Por eso, el sistema combina una parte pública para clientes y una parte administrativa para quienes deben operar la tienda.")

doc.add_heading("3.1. Catálogo de productos", level=2)
add_step_list(doc, [
    "El catálogo muestra los productos disponibles para que los usuarios puedan verlos, compararlos y elegir los que desean comprar.",
    "Los productos pueden organizarse por categorías y subcategorías para facilitar la navegación.",
    "Cada producto puede contar con nombre, descripción, precio, imagen y estado de disponibilidad.",
    "Cuando un producto está inactivo o sin stock, el sistema debe evitar que se venda de forma normal.",
])

doc.add_heading("3.2. Gestión de usuarios y autenticación", level=2)
add_step_list(doc, [
    "Los usuarios pueden registrarse, iniciar sesión y administrar sus datos personales.",
    "El sistema usa autenticación segura para proteger el acceso a la cuenta.",
    "Cada cuenta tiene un rol que define qué puede hacer dentro del sistema.",
    "Esto evita que un usuario común acceda a funciones administrativas o sensibles.",
])

doc.add_heading("3.3. Carrito, favoritos y pedidos", level=2)
add_step_list(doc, [
    "El carrito permite reunir varios productos antes de confirmar la compra.",
    "Los usuarios pueden modificar cantidades, eliminar artículos o vaciar el carrito si cambian de opinión.",
    "Los favoritos sirven para guardar productos que desean revisar después.",
    "Cuando se confirma un pedido, el sistema registra la compra y reduce el stock disponible para evitar ventas duplicadas.",
])

doc.add_heading("3.4. Personalización y cotizaciones", level=2)
add_step_list(doc, [
    "La personalización permite crear diseños únicos para productos con estilo, color o texto propio.",
    "Esto es útil cuando el cliente desea una pieza con características especiales.",
    "El sistema también permite generar cotizaciones para evaluar el diseño antes de convertirlo en una compra formal.",
    "Esta función ayuda a que el cliente vea el resultado antes de comprometerse con la compra.",
])

doc.add_heading("3.5. Gestión administrativa", level=2)
add_step_list(doc, [
    "Los administradores pueden crear, modificar o desactivar categorías, subcategorías y productos.",
    "También pueden gestionar usuarios, revisar pedidos y controlar el estado de las ventas.",
    "La administración incluye el manejo de imágenes, stock y datos de soporte.",
    "Estas funciones son necesarias para mantener la tienda ordenada y operativa.",
])

doc.add_heading("3.6. Soporte y ayuda", level=2)
add_step_list(doc, [
    "El sistema incluye un módulo de soporte para que los usuarios puedan presentar dudas o reportar problemas.",
    "Esto permite canalizar consultas y resolver incidentes de forma más organizada.",
    "La atención al cliente es una parte importante del funcionamiento de la plataforma.",
])

# Sección 4 - Restricciones por tipo de usuario
doc.add_heading("4. Restricciones por tipo de usuario", level=1)
p = doc.add_paragraph()
p.add_run("YESA no permite que todos los usuarios hagan todo. Las restricciones existen para proteger la información, evitar cambios accidentales y mantener el sistema ordenado. Cada rol tiene acceso a las funciones que le corresponden según su responsabilidad.")

doc.add_heading("4.1. Cliente", level=2)
add_step_list(doc, [
    "Un cliente puede ver el catálogo, buscar productos, agregar artículos al carrito y hacer pedidos.",
    "También puede guardar productos como favoritos, revisar su historial de pedidos y actualizar su perfil.",
    "No puede entrar al panel administrativo ni modificar categorías, productos o usuarios.",
    "Esta restricción existe porque un cliente no debe tener acceso a información interna ni poder alterar la tienda.",
])

doc.add_heading("4.2. Auxiliar", level=2)
add_step_list(doc, [
    "Un auxiliar puede acceder a funciones limitadas del panel administrativo para apoyar la operación diaria.",
    "Puede revisar información relevante, ayudar con procesos de gestión y consultar datos del sistema.",
    "Sin embargo, no puede realizar operaciones críticas como eliminar usuarios o eliminar datos sensibles de forma definitiva.",
    "La razón de esta limitación es evitar errores o cambios que puedan afectar la seguridad o la integridad del negocio.",
])

doc.add_heading("4.3. Administrador", level=2)
add_step_list(doc, [
    "El administrador tiene el mayor nivel de acceso y puede manejar la tienda completa.",
    "Puede crear y modificar categorías, subcategorías, productos, usuarios y pedidos.",
    "También puede revisar el estado general del sistema y tomar decisiones de control.",
    "Este rol existe porque solo una persona o equipo de confianza debe tener capacidad para modificar la configuración principal del sistema.",
])

doc.add_heading("4.4. Por qué las restricciones son importantes", level=2)
add_step_list(doc, [
    "Las restricciones protegen la información y evitan que un usuario no autorizado cambie datos importantes.",
    "También ayudan a evitar errores humanos al limitar las acciones a las personas que realmente deben realizarlas.",
    "En un sistema de negocio, esta separación de funciones mejora la seguridad y la trazabilidad.",
])

# Sección 5 - Requisitos básicos
doc.add_heading("5. Requisitos básicos", level=1)
p = doc.add_paragraph()
p.add_run("Antes de usar YESA, es importante tener a mano un navegador web, una conexión a internet y acceso a la plataforma. Si el sistema se está usando en un equipo local, también debe estar activo el servidor del backend y la base de datos.")

add_step_list(doc, [
    "Use un navegador como Chrome, Edge o Firefox. Estos son los navegadores más compatibles con la plataforma.",
    "Asegúrese de que su internet funcione correctamente antes de intentar abrir la página.",
    "Si la plataforma se está ejecutando en un equipo local, confirme que el programa del servidor esté encendido.",
    "Si ve una pantalla en blanco o un mensaje de error, revise primero si la conexión y el servidor están activos.",
])

# Sección 6 - Instalación y puesta en marcha
doc.add_heading("4. Instalación y puesta en marcha", level=1)
p = doc.add_paragraph()
p.add_run("Si el sistema no está instalado todavía, debe prepararlo antes de usarlo. Esta parte se realiza una sola vez y consiste en abrir el proyecto, instalar dependencias y arrancar los servicios principales.")

doc.add_heading("4.1. Preparar el equipo", level=2)
add_step_list(doc, [
    "Abra la carpeta del proyecto en un editor de código, por ejemplo Visual Studio Code.",
    "Revise que la carpeta del backend y la carpeta del frontend estén presentes.",
    "Si la base de datos no está activa, encienda MySQL o XAMPP antes de continuar.",
    "Si el sistema necesita credenciales, confirme que los datos de conexión estén correctos.",
])

doc.add_heading("4.2. Iniciar el backend", level=2)
add_step_list(doc, [
    "Abra una terminal y vaya a la carpeta del backend.",
    "Escriba el comando npm install y espere a que termine la instalación de las dependencias.",
    "Luego ejecute el comando para iniciar el servidor.",
    "Si todo está bien, el sistema responderá desde el puerto correspondiente y podrá recibir solicitudes del navegador.",
])

doc.add_heading("4.3. Iniciar el frontend", level=2)
add_step_list(doc, [
    "Abra otra terminal y diríjase a la carpeta del frontend.",
    "Escriba npm install para instalar las herramientas necesarias para mostrar la interfaz.",
    "Luego inicie la aplicación con el comando para abrir la página web.",
    "Cuando la interfaz cargue correctamente, podrá comenzar a usar la plataforma.",
])

# Sección 5 - Registro e inicio de sesión
doc.add_heading("5. Registro e inicio de sesión", level=1)
p = doc.add_paragraph()
p.add_run("Para poder comprar, guardar favoritos o usar las funciones personalizadas, lo primero que debe hacer es crear una cuenta. El registro es simple y solo requiere datos básicos para identificarlo dentro del sistema.")

doc.add_heading("5.1. Crear una cuenta", level=2)
add_step_list(doc, [
    "Abra la página principal del sistema en su navegador.",
    "Busque la opción de registro y haga clic sobre ella.",
    "Complete los campos con su nombre, correo electrónico, contraseña y cualquier dato adicional que se solicite.",
    "Revise que toda la información esté correcta antes de enviar el formulario.",
    "Cuando el sistema confirme la creación de la cuenta, podrá iniciar sesión.",
])

doc.add_heading("5.2. Iniciar sesión", level=2)
add_step_list(doc, [
    "En la pantalla inicial, seleccione la opción de inicio de sesión.",
    "Escriba su correo electrónico y su contraseña tal como los registró.",
    "Haga clic en el botón para entrar.",
    "Si los datos son correctos, el sistema le mostrará su perfil o la página principal con acceso completo.",
    "Si no puede entrar, revise si escribió correctamente la contraseña o si la cuenta aún está activa.",
])

doc.add_heading("5.3. Gestionar su perfil", level=2)
add_step_list(doc, [
    "Ingrese a la sección de perfil dentro del sistema.",
    "Revise sus datos personales para confirmar que estén correctos.",
    "Si necesita actualizar información, cambie los datos y guarde los cambios.",
    "Cuando termine, cierre sesión si ya no va a usar la plataforma.",
])

# Sección 6 - Explorar el catálogo
doc.add_heading("6. Explorar el catálogo", level=1)
p = doc.add_paragraph()
p.add_run("El catálogo es la zona donde se muestran los productos disponibles. Aquí puede mirar los artículos, conocer su precio y elegir los que más le interesen.")

doc.add_heading("6.1. Buscar productos", level=2)
add_step_list(doc, [
    "Ingrese al catálogo desde la página principal.",
    "Observe la lista de productos que aparece en pantalla.",
    "Si tiene claro lo que desea, use los filtros o la búsqueda para encontrarlo más rápido.",
    "Haga clic sobre la imagen o el nombre del producto para abrir su detalle.",
])

doc.add_heading("6.2. Revisar el detalle de un producto", level=2)
add_step_list(doc, [
    "En la vista de detalle, lea la descripción para entender qué ofrece el producto.",
    "Revise la imagen para ver cómo se ve.",
    "Observe el precio y la disponibilidad para saber si está listo para comprar.",
    "Si está conforme, puede agregarlo al carrito o guardar el producto para luego.",
])

# Sección 7 - Comprar productos
doc.add_heading("7. Comprar productos", level=1)
p = doc.add_paragraph()
p.add_run("El proceso de compra está diseñado para ser sencillo. Cada paso le ayudará a revisar los productos, confirmar la compra y recibir una respuesta del sistema.")

doc.add_heading("7.1. Agregar productos al carrito", level=2)
add_step_list(doc, [
    "Seleccione un producto que desea comprar.",
    "En la vista del producto, haga clic en la opción para agregarlo al carrito.",
    "Si el sistema le pide una cantidad, escriba la cantidad que desea comprar.",
    "Revise que el producto haya aparecido en la lista del carrito.",
])

doc.add_heading("7.2. Revisar el carrito", level=2)
add_step_list(doc, [
    "Abra la sección del carrito desde la interfaz.",
    "Revise uno por uno los productos seleccionados.",
    "Si necesita cambiar la cantidad, modifíquela desde allí.",
    "Si decide quitar un producto, elimínelo antes de continuar.",
])

doc.add_heading("7.3. Confirmar la compra", level=2)
add_step_list(doc, [
    "Cuando el carrito esté listo, haga clic en la opción de confirmar compra o continuar.",
    "Complete los datos de envío o contacto que el sistema solicite.",
    "Revise que el pedido muestre los productos correctos y el total correcto.",
    "Confirme la compra y espere a que el sistema genere el pedido.",
])

doc.add_heading("7.4. Consultar el estado del pedido", level=2)
add_step_list(doc, [
    "Vaya a la sección de pedidos dentro de su cuenta.",
    "Seleccione el pedido que desea revisar.",
    "Observe el estado actual del pedido para saber si ya fue procesado, enviado o entregado.",
    "Si el estado no coincide con lo esperado, use el soporte para pedir ayuda.",
])

# Sección 8 - Guardar productos favoritos
doc.add_heading("8. Guardar productos favoritos", level=1)
p = doc.add_paragraph()
p.add_run("Los favoritos sirven para guardar productos que le interesan y revisarlos más tarde. Esto es útil cuando desea comparar opciones o comprar más adelante.")

add_step_list(doc, [
    "Abra la vista de detalle de un producto que le guste.",
    "Busque la opción de agregar a favoritos y haga clic sobre ella.",
    "El producto quedará guardado en su lista personal.",
    "Si ya no lo necesita, puede eliminarlo cuando lo desee.",
])

# Sección 9 - Crear cotizaciones y diseños personalizados
doc.add_heading("9. Crear cotizaciones y diseños personalizados", level=1)
p = doc.add_paragraph()
p.add_run("YESA permite crear diseños únicos para productos personalizados. Esta función es especialmente útil cuando el cliente desea una pieza con un estilo particular, un nombre, un color o una imagen distinta.")

doc.add_heading("9.1. Crear un diseño", level=2)
add_step_list(doc, [
    "Ingrese a la opción de personalización desde la interfaz.",
    "Seleccione el producto o modelo base que desea modificar.",
    "Cambie colores, texturas o elementos visuales según su preferencia.",
    "Si lo necesita, agregue texto o una imagen personalizada.",
    "Revise la vista previa antes de continuar.",
])

doc.add_heading("9.2. Guardar y cotizar", level=2)
add_step_list(doc, [
    "Cuando el diseño se vea correcto, guárdelo con un nombre claro.",
    "Luego genere una cotización para que el sistema la registre.",
    "Revise la información antes de enviarla.",
    "Si el diseño es aprobado, puede convertirse luego en un pedido real.",
])

# Sección 10 - Gestión administrativa
doc.add_heading("10. Gestión administrativa", level=1)
p = doc.add_paragraph()
p.add_run("Si usted tiene permisos de administrador o auxiliar, podrá gestionar productos, pedidos, categorías, usuarios y soporte. Estas tareas deben realizarse con orden y responsabilidad, porque afectan directamente la operación de la tienda y la experiencia de los clientes.")

p = doc.add_paragraph()
p.add_run("El sistema separa claramente las funciones por rol para evitar que personas sin la responsabilidad adecuada cambien información crítica. Esta separación es importante porque un error en una categoría, un producto o un pedido puede afectar ventas, inventario y confianza del cliente.")

p = doc.add_paragraph()
p.add_run("A continuación se muestra un resumen de los permisos más importantes por rol:")

# Tabla resumen de permisos

table = doc.add_table(rows=1, cols=3)
table.style = "Table Grid"
headers = table.rows[0].cells
headers[0].text = "Rol"
headers[1].text = "Qué puede hacer"
headers[2].text = "Por qué tiene esa limitación"

rows = [
    ("Cliente", "Ver catálogo, comprar, usar carrito, guardar favoritos, revisar pedidos y actualizar su perfil", "Solo debe manejar su propia experiencia de compra y no modificar el funcionamiento de la tienda"),
    ("Auxiliar", "Consultar y apoyar tareas de administración básicas, revisar operaciones y colaborar en gestión limitada", "Tiene acceso de apoyo, pero no debe hacer cambios críticos que afecten la seguridad o la estructura del sistema"),
    ("Administrador", "Gestionar categorías, subcategorías, productos, usuarios, pedidos, cotizaciones y soporte", "Es el rol con mayor responsabilidad y debe tener control total porque opera la tienda completa"),
]
for rol, permisos, motivo in rows:
    row_cells = table.add_row().cells
    row_cells[0].text = rol
    row_cells[1].text = permisos
    row_cells[2].text = motivo

add_step_list(doc, [
    "Ingrese al panel administrativo con su usuario autorizado.",
    "Revise los módulos disponibles según su rol.",
    "Si va a agregar o modificar un producto, confirme primero que toda la información sea correcta.",
    "Cuando termine una tarea, revise que los cambios se hayan guardado correctamente.",
    "Si una acción es crítica o delicada, use el rol de administrador y evite realizar cambios sin verificar.",
])

doc.add_heading("10.1. Gestión de categorías y subcategorías", level=2)
add_step_list(doc, [
    "Las categorías ayudan a organizar el catálogo y que los clientes encuentren productos más rápido.",
    "Las subcategorías permiten dividir aún más la información para una navegación más clara.",
    "Cuando una categoría se desactiva, el sistema debe afectar también las opciones relacionadas para evitar que se muestren productos impropios.",
])

doc.add_heading("10.2. Gestión de productos", level=2)
add_step_list(doc, [
    "Los productos deben incluir información clara, precio, stock y una imagen cuando sea necesario.",
    "Un producto desactivado no debe aparecer como disponible para la compra normal.",
    "El stock es importante porque evita vender productos que ya no están disponibles.",
])

doc.add_heading("10.3. Gestión de usuarios", level=2)
add_step_list(doc, [
    "Los usuarios deben manejarse con cuidado porque están relacionados con pedidos, accesos y seguridad.",
    "Un administrador puede revisar cuentas y cambiar estados, pero debe hacerlo con responsabilidad.",
    "Esta función existe para evitar que cuentas no autorizadas sigan operando en la plataforma.",
])

doc.add_heading("10.4. Gestión de pedidos y soporte", level=2)
add_step_list(doc, [
    "Los pedidos deben revisarse para confirmar que llegaron correctamente al sistema.",
    "El soporte permite resolver problemas y aclarar dudas del cliente.",
    "Estas tareas son esenciales para que la operación comercial funcione de forma ordenada.",
])

# Sección 11 - Soporte y ayuda
doc.add_heading("11. Soporte y ayuda", level=1)
p = doc.add_paragraph()
p.add_run("Si tiene dudas, observa un error o necesita ayuda para completar una compra, puede usar la sección de soporte. El soporte sirve para pedir asistencia sin necesidad de tener conocimientos técnicos.")

add_step_list(doc, [
    "Abra la sección de soporte o ayuda desde la interfaz.",
    "Escriba un mensaje claro explicando el problema o la duda.",
    "Incluya información útil como el nombre del producto, el pedido o la pantalla donde ocurrió el problema.",
    "Envíe la solicitud y espere la respuesta del equipo encargado.",
])

# Sección 12 - Solución de problemas frecuentes
doc.add_heading("12. Solución de problemas frecuentes", level=1)
for item, desc in [
    ("No puedo entrar al sistema", "Revise si escribió bien su correo y contraseña. Si sigue sin funcionar, confirme que la cuenta esté activa y que el servidor esté disponible."),
    ("No aparece la página", "Compruebe que su internet funcione, que la dirección esté escrita correctamente y que el servicio del sistema esté encendido."),
    ("No veo los productos", "Verifique que los productos estén activos en la base de datos y que el catálogo se haya cargado correctamente."),
    ("No puedo completar una compra", "Revise que el carrito no esté vacío, que haya datos de envío completos y que haya disponibilidad del producto."),
    ("No se suben imágenes", "Confirme que la carpeta de archivos esté disponible y que los permisos de escritura funcionen correctamente."),
]:
    p = doc.add_paragraph(style="Heading2")
    p.add_run(item)
    p = doc.add_paragraph()
    p.add_run(desc)

# Sección 13 - Recomendaciones finales
doc.add_heading("13. Recomendaciones finales", level=1)
add_step_list(doc, [
    "Lea cada paso con calma y no presione botones rápidamente si no está seguro de lo que hace.",
    "Revise siempre el carrito antes de confirmar una compra.",
    "Guarde sus datos de acceso en un lugar seguro.",
    "Si necesita ayuda, use el soporte antes de intentar resolver el problema por su cuenta.",
    "Mantenga el sistema actualizado y use un navegador moderno para evitar errores innecesarios.",
])

# Sección 14 - Glosario sencillo
doc.add_heading("14. Glosario sencillo", level=1)
add_step_list(doc, [
    "Catálogo: la lista de productos que se pueden ver y comprar.",
    "Carrito: el lugar donde se guardan los productos que el usuario quiere comprar.",
    "Pedido: la compra ya confirmada dentro del sistema.",
    "Cotización: una propuesta de precio o diseño para un producto personalizado.",
    "Stock: la cantidad disponible de un producto para vender.",
    "Favorito: un producto guardado para revisarlo después.",
    "Panel administrativo: la zona donde los administradores gestionan la tienda.",
    "Soporte: la herramienta para pedir ayuda o resolver dudas.",
])

# Sección 15 - Preguntas frecuentes
doc.add_heading("15. Preguntas frecuentes", level=1)
for item, desc in [
    ("¿Cómo creo una cuenta?", "Ingrese a la opción de registro, complete los datos pedidos y confirme el formulario."),
    ("¿Qué hago si olvidé mi contraseña?", "Use la opción de recuperación o solicite ayuda al administrador o al soporte."),
    ("¿Cómo sé si mi pedido fue recibido?", "Revise la sección de pedidos y observe el estado actualizado del pedido."),
    ("¿Puedo cambiar un producto después de agregarlo al carrito?", "Sí, puede modificar la cantidad o eliminarlo antes de confirmar la compra."),
    ("¿Qué pasa si un producto ya no tiene stock?", "El sistema debe evitar que se complete la compra si el producto ya no está disponible."),
]:
    p = doc.add_paragraph(style="Heading2")
    p.add_run(item)
    p = doc.add_paragraph()
    p.add_run(desc)

# Sección 16 - Ejemplo práctico de compra completa
doc.add_heading("16. Ejemplo práctico de compra completa", level=1)
add_step_list(doc, [
    "Abra la plataforma y cree una cuenta si aún no tiene una.",
    "Ingrese al catálogo y busque un producto que le interese.",
    "Abra el detalle del producto y revise la descripción, precio e imagen.",
    "Agregue el producto al carrito.",
    "Revise el carrito para confirmar la cantidad y los productos seleccionados.",
    "Haga clic en confirmar compra y complete los datos solicitados.",
    "Espere a que el sistema genere el pedido y revise su estado en la sección de pedidos.",
])

# Sección 17 - Estados del pedido y qué significan
doc.add_heading("17. Estados del pedido y qué significan", level=1)
add_step_list(doc, [
    "Pendiente: el pedido fue creado pero aún no ha sido procesado completamente.",
    "Procesado: el pedido ya fue aceptado y está siendo revisado por la tienda.",
    "Enviado: el pedido ya salió para entrega.",
    "Entregado: el pedido llegó a su destino.",
    "Cancelado: el pedido fue anulado y ya no continúa como compra activa.",
])

# Sección 18 - Recomendaciones de seguridad
doc.add_heading("18. Recomendaciones de seguridad", level=1)
add_step_list(doc, [
    "No comparta su contraseña con nadie.",
    "Use una contraseña segura y distinta a las que usa en otros servicios.",
    "Cierre sesión si está utilizando un equipo compartido.",
    "Revise que sus datos personales estén correctos antes de comprar.",
    "Si detecta actividad sospechosa, contacte de inmediato al soporte.",
])

# Sección 19 - Orientación visual para el usuario
doc.add_heading("19. Orientación visual para el usuario", level=1)
add_step_list(doc, [
    "La página principal suele ser el punto de entrada más cómodo para comenzar.",
    "El menú o catálogo suele mostrar las opciones de navegación más importantes.",
    "El botón de carrito permite revisar los productos seleccionados antes de comprar.",
    "La sección de perfil permite ver y editar los datos del usuario.",
    "La opción de soporte sirve para pedir ayuda cuando algo no funciona como se espera.",
])

# Sección 20 - Conclusión
doc.add_heading("20. Conclusión", level=1)
p = doc.add_paragraph()
p.add_run("YESA está pensado para ser una plataforma útil, visual y fácil de usar. Con este manual, cualquier usuario podrá comprender mejor cómo registrarse, comprar, personalizar productos y resolver dudas de forma simple y segura.")