from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Border, Side, Alignment
from pathlib import Path

out_path = Path(r"c:\Users\joser\OneDrive\Documentos\GitHub\software-YESA\Docs\plantillas\YESA_Gantt.xlsx")
out_path.parent.mkdir(parents=True, exist_ok=True)

wb = Workbook()
ws = wb.active
ws.title = 'Resumen YESA'

ws['A1'] = 'Proyecto'
ws['B1'] = 'YESA - E-commerce personalizado'
ws['A2'] = 'Objetivo'
ws['B2'] = 'Desarrollar una plataforma de comercio electrónico especializada en productos personalizados para orfebrería y cerámica artesanal.'
ws['A3'] = 'Justificación'
ws['B3'] = 'Resolver la falta de experiencias de compra personalizables y la necesidad de productos únicos, con gestión integral de catálogo, pedidos y administración.'
ws['A4'] = 'Feedback clave'
ws['B4'] = 'Priorizar personalización, carrito de compras, panel administrativo y experiencia de usuario fluida para clientes y equipo interno.'
ws['A5'] = 'Metodología'
ws['B5'] = 'Desarrollo iterativo con enfoque en backend, frontend, pruebas, documentación y puesta en marcha.'

for row in range(1, 6):
    for col in ['A', 'B']:
        ws[f'{col}{row}'].font = Font(bold=(col == 'A'), size=11)
        ws[f'{col}{row}'].alignment = Alignment(vertical='top', wrap_text=True)

ws.column_dimensions['A'].width = 22
ws.column_dimensions['B'].width = 95


def render_progress(percent):
    blocks = 10
    filled = int(round(percent / 100 * blocks))
    filled = max(0, min(blocks, filled))
    return '█' * filled + '░' * (blocks - filled)


def badge_for_status(status):
    if status == 'Completado':
        return PatternFill('solid', fgColor='C6EFCE')
    if status == 'En curso':
        return PatternFill('solid', fgColor='FFE699')
    return PatternFill('solid', fgColor='F4CCCC')


ws2 = wb.create_sheet('Diagrama Gantt')
headers = [
    'Actividad',
    'Trimestre',
    'Inicio planeado',
    'Duración planeada/esperada',
    'Finalización planeada/esperada',
    'Inicio real',
    'Duración real',
    'Finalización real',
    '% completado',
    'Responsables',
    'Estado',
    'Barra visual',
]
ws2.append(headers)
rows = [
    ['Nombre proyecto - Objetivo general - Objetivos específicos - Planteamiento del problema y pregunta problema - Alcance del proyecto - Justificación', 'T1 2025', '2025-04-29', '2 semanas', '2025-05-13', '2025-04-29', '2 semanas', '2025-05-13', 100, 'Ian — Líder / analista', 'Completado', render_progress(100)],
    ['Mapa de procesos BPMN del negocio', 'T1 2025', '2025-05-01', '2 semanas', '2025-05-15', '2025-05-01', '2 semanas', '2025-05-15', 100, 'Daniel — Analista funcional', 'Completado', render_progress(100)],
    ['Técnicas de recolección de información y análisis estadístico', 'T1 2025', '2025-05-15', '2 semanas', '2025-05-29', '2025-05-15', '2 semanas', '2025-05-29', 100, 'Ian — Líder / analista, Daniel — Analista funcional', 'Completado', render_progress(100)],
    ['Requerimientos funcionales y no funcionales (IEEE 830/1233/29148 o historias de usuario)', 'T1 2025', '2025-05-20', '3 semanas', '2025-06-10', '2025-05-20', '3 semanas', '2025-06-10', 100, 'Ian — Líder / analista, Daniel — Analista funcional', 'Completado', render_progress(100)],
    ['Validación de requerimientos con prototipo/mockups/wireframes', 'T1 2025', '2025-06-01', '2 semanas', '2025-06-15', '2025-06-01', '2 semanas', '2025-06-15', 100, 'Sebastián — Diseñador UX / frontend, Ian — Líder / analista', 'Completado', render_progress(100)],
    ['Uso de sistemas de control de versiones', 'T1 2025', '2025-04-29', '6 semanas', '2025-06-10', '2025-04-29', '6 semanas', '2025-06-10', 100, 'Raúl — Desarrollador backend, Sebastián — Desarrollador frontend', 'Completado', render_progress(100)],
    ['Formatos de fichas técnicas y estimación de costos', 'T2 2025', '2025-06-16', '2 semanas', '2025-06-30', '2025-06-16', '2 semanas', '2025-06-30', 100, 'Daniel — Analista funcional, Ian — Líder / analista', 'Completado', render_progress(100)],
    ['Diagrama de casos de uso y documentación extendida', 'T2 2025', '2025-07-01', '2 semanas', '2025-07-15', '2025-07-01', '2 semanas', '2025-07-15', 100, 'Ian — Líder / analista, Daniel — Analista funcional', 'Completado', render_progress(100)],
    ['Modelo entidad relación con notación crow’s foot', 'T2 2025', '2025-07-01', '2 semanas', '2025-07-15', '2025-07-01', '2 semanas', '2025-07-15', 100, 'Raúl — Desarrollador backend', 'Completado', render_progress(100)],
    ['Normalización del modelo relacional (3FN)', 'T2 2025', '2025-07-16', '2 semanas', '2025-07-30', '2025-07-16', '2 semanas', '2025-07-30', 100, 'Raúl — Desarrollador backend', 'Completado', render_progress(100)],
    ['Diccionario de datos', 'T2 2025', '2025-07-16', '2 semanas', '2025-07-30', '2025-07-16', '2 semanas', '2025-07-30', 100, 'Raúl — Desarrollador backend, Daniel — Analista funcional', 'Completado', render_progress(100)],
    ['Diagrama de clases UML 2.4.1', 'T2 2025', '2025-08-01', '2 semanas', '2025-08-15', '2025-08-01', '2 semanas', '2025-08-15', 100, 'Raúl — Desarrollador backend, Sebastián — Desarrollador frontend', 'Completado', render_progress(100)],
    ['Diagrama de despliegue UML 2.4.1', 'T2 2025', '2025-08-01', '2 semanas', '2025-08-15', '2025-08-01', '2 semanas', '2025-08-15', 100, 'Raúl — Desarrollador backend', 'Completado', render_progress(100)],
    ['Uso de sistemas de control de versiones', 'T2 2025', '2025-06-16', '8 semanas', '2025-08-15', '2025-06-16', '8 semanas', '2025-08-15', 100, 'Raúl — Desarrollador backend, Sebastián — Desarrollador frontend', 'Completado', render_progress(100)],
    ['Construcción de la base de datos con DDL/Schema Validation', 'T3 2025', '2025-08-16', '4 semanas', '2025-09-13', '2025-08-16', '4 semanas', '2025-09-13', 100, 'Raúl — Desarrollador backend', 'Completado', render_progress(100)],
    ['Uso de la base de datos con DML/CRUD y consultas', 'T3 2025', '2025-09-01', '3 semanas', '2025-09-20', '2025-09-01', '3 semanas', '2025-09-20', 100, 'Raúl — Desarrollador backend', 'Completado', render_progress(100)],
    ['Seguridad de la base de datos: encriptación y protección de datos', 'T3 2025', '2025-09-10', '2 semanas', '2025-09-24', '2025-09-10', '2 semanas', '2025-09-24', 100, 'Raúl — Desarrollador backend', 'Completado', render_progress(100)],
    ['Front-end funcional con framework web y autenticación JWT', 'T3 2025', '2025-09-15', '4 semanas', '2025-10-13', '2025-09-15', '4 semanas', '2025-10-13', 100, 'Sebastián — Desarrollador frontend, Ian — Líder / analista', 'Completado', render_progress(100)],
    ['Uso de sistemas de control de versiones', 'T3 2025', '2025-08-16', '8 semanas', '2025-10-13', '2025-08-16', '8 semanas', '2025-10-13', 100, 'Raúl — Desarrollador backend, Sebastián — Desarrollador frontend', 'Completado', render_progress(100)],
    ['Prototipo navegable del software (HTML/CSS)', 'T3 2025', '2025-09-20', '3 semanas', '2025-10-11', '2025-09-20', '3 semanas', '2025-10-11', 100, 'Sebastián — Desarrollador frontend', 'Completado', render_progress(100)],
    ['Implementación de la API REST agregando seguridad', 'T4 2025', '2025-10-14', '4 semanas', '2025-11-11', '2025-10-14', '4 semanas', '2025-11-11', 100, 'Raúl — Desarrollador backend', 'Completado', render_progress(100)],
    ['Front-end web consumiendo la API REST (avance 80%)', 'T4 2025', '2025-10-14', '4 semanas', '2025-11-11', '2025-10-14', '4 semanas', '2025-11-11', 100, 'Sebastián — Desarrollador frontend', 'Completado', render_progress(100)],
    ['Uso de sistemas de control de versiones', 'T4 2025', '2025-10-14', '6 semanas', '2025-11-25', '2025-10-14', '6 semanas', '2025-11-25', 100, 'Raúl — Desarrollador backend, Sebastián — Desarrollador frontend', 'Completado', render_progress(100)],
    ['Desarrollo de la codificación al 100%', 'T5 2025', '2025-11-26', '6 semanas', '2026-01-07', '2025-11-26', '6 semanas', '2026-01-07', 100, 'Raúl — Desarrollador backend, Sebastián — Desarrollador frontend', 'Completado', render_progress(100)],
    ['Consumo de la API REST con aplicaciones móviles', 'T5 2025', '2026-01-08', '3 semanas', '2026-01-29', '2026-01-08', '3 semanas', '2026-01-29', 100, 'Sebastián — Desarrollador frontend, Raúl — Desarrollador backend', 'Completado', render_progress(100)],
    ['Implementación de la API REST documentada (Swagger u otra herramienta)', 'T5 2025', '2026-01-08', '2 semanas', '2026-01-22', '2026-01-08', '2 semanas', '2026-01-22', 100, 'Raúl — Desarrollador backend, Daniel — Analista funcional', 'Completado', render_progress(100)],
    ['Aplicación de metodología ágil (historias de usuario, roles, sprints, backlog)', 'T5 2025', '2026-01-15', '3 semanas', '2026-02-05', '2026-01-15', '3 semanas', '2026-02-05', 100, 'Ian — Líder / analista, Daniel — Analista funcional', 'Completado', render_progress(100)],
    ['Técnicas de pruebas de software', 'T6 2025', '2026-06-01', '4 semanas', '2026-09-10', '2026-06-01', 'En curso', '', 35, 'Ian — Líder / analista, Raúl — Desarrollador backend, Sebastián — Desarrollador frontend', 'En curso', render_progress(35)],
    ['Plan de instalación, respaldo, migración y capacitación', 'T6 2025', '2026-06-15', '4 semanas', '2026-09-10', '2026-06-15', 'En curso', '', 30, 'Daniel — Analista funcional, Ian — Líder / analista, Sebastián — Desarrollador frontend', 'En curso', render_progress(30)],
    ['Modelo de calidad', 'T6 2025', '2026-06-20', '3 semanas', '2026-09-10', '2026-06-20', 'En curso', '', 25, 'Ian — Líder / analista, Daniel — Analista funcional', 'En curso', render_progress(25)],
    ['Manuales de instalación, técnico y de usuario', 'T6 2025', '2026-07-01', '4 semanas', '2026-09-10', '2026-07-01', 'En curso', '', 40, 'Daniel — Analista funcional, Sebastián — Desarrollador frontend', 'En curso', render_progress(40)],
    ['Despliegue del aplicativo según diseño de arquitectura UML', 'T6 2025', '2026-07-15', '4 semanas', '2026-09-10', '2026-07-15', 'En curso', '', 20, 'Raúl — Desarrollador backend, Sebastián — Desarrollador frontend', 'En curso', render_progress(20)],
    ['Uso de sistemas de control de versiones', 'T6 2025', '2026-06-01', '4 semanas', '2026-09-10', '2026-06-01', 'En curso', '', 45, 'Raúl — Desarrollador backend, Sebastián — Desarrollador frontend', 'En curso', render_progress(45)],
]
for row in rows:
    ws2.append(row)

for cell in ws2[1]:
    cell.font = Font(bold=True, color='FFFFFF')
    cell.fill = PatternFill('solid', fgColor='1F4E78')
    cell.alignment = Alignment(horizontal='center', vertical='center')

thin = Border(
    left=Side(style='thin', color='D9D9D9'),
    right=Side(style='thin', color='D9D9D9'),
    top=Side(style='thin', color='D9D9D9'),
    bottom=Side(style='thin', color='D9D9D9')
)
for row in ws2.iter_rows(min_row=1, max_row=ws2.max_row):
    for cell in row:
        cell.border = thin
        cell.alignment = Alignment(vertical='center', wrap_text=True)

for row_index in range(2, ws2.max_row + 1):
    status = ws2.cell(row=row_index, column=11).value
    ws2.cell(row=row_index, column=12).font = Font(name='Consolas', sz=12)
    ws2.cell(row=row_index, column=12).alignment = Alignment(horizontal='left')
    ws2.cell(row=row_index, column=1).fill = badge_for_status(status)
    ws2.cell(row=row_index, column=11).fill = badge_for_status(status)
    ws2.cell(row=row_index, column=12).fill = PatternFill('solid', fgColor='EAF2F8')

ws3 = wb.create_sheet('Vista Gantt')
ws3['A1'] = 'Vista visual del Gantt - Proyecto YESA'
ws3['A1'].font = Font(bold=True, size=14)
headers_v = ['Actividad', 'Trimestre', 'Inicio planeado', 'Fin planeado', 'Inicio real', 'Fin real', 'Estado', 'Progreso']
for col, value in enumerate(headers_v, start=1):
    ws3.cell(row=3, column=col, value=value)
    ws3.cell(row=3, column=col).font = Font(bold=True)
    ws3.cell(row=3, column=col).fill = PatternFill('solid', fgColor='D9EAF7')

for i, row in enumerate(rows, start=4):
    ws3.cell(row=i, column=1, value=row[0])
    ws3.cell(row=i, column=2, value=row[1])
    ws3.cell(row=i, column=3, value=row[2])
    ws3.cell(row=i, column=4, value=row[4])
    ws3.cell(row=i, column=5, value=row[5])
    ws3.cell(row=i, column=6, value=row[7])
    ws3.cell(row=i, column=7, value=row[10])
    ws3.cell(row=i, column=8, value=row[11])

for row in ws3.iter_rows(min_row=3, max_row=ws3.max_row):
    for cell in row:
        cell.border = thin
        cell.alignment = Alignment(vertical='center', wrap_text=True)

for col in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']:
    ws3.column_dimensions[col].width = 24 if col in {'A', 'H'} else 16

wb.save(out_path)
print(f'Created {out_path}')
