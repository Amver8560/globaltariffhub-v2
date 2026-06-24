# GTH — Ideas de Producto para Desarrollo Futuro

---

## 💡 MÓDULO 05 — Alertas Comerciales por Código HS
> **Idea surgida:** Junio 2026  
> **Fuente que la inspiró:** [Global Trade Alert](https://www.globaltradealert.org/)

### Concepto
Un módulo que alerta al usuario cuando su código HS está afectado por medidas comerciales activas o recientes: antidumping, subsidios, cuotas especiales, barreras sanitarias, medidas de salvaguarda.

### Por qué es valioso
Los aranceles MFN y las tasas preferenciales **no reflejan lo que pasa en la práctica**. Un código puede tener tasa 0% y aun así estar bloqueado por una medida antidumping vigente o una cuota agotada. Global Trade Alert cubre eso desde 2009 en tiempo real.

### Funcionalidad propuesta
- El usuario ingresa su código HS + país de origen + país de destino
- El sistema consulta Global Trade Alert y filtra alertas activas para esa combinación
- Muestra: tipo de medida, fecha de entrada en vigor, organismo que la impuso, estado (activa / en revisión / derogada)
- Clasificación por riesgo: 🔴 Alto (bloqueo efectivo) / 🟡 Medio (cuota parcial) / 🟢 Bajo (medida informativa)

### Fuente de datos
- **URL:** https://www.globaltradealert.org/
- **Acceso:** Público — informes descargables + posible API
- **Complementa:** WTO MFN, TARIC, NCM — cubre la capa "en la práctica"

### Integración posible
- Agregar un aviso en M01 (Buscador) cuando el código tiene alertas activas
- Módulo independiente con historial y suscripción a alertas por código

---

## 🏛 CONSTITUCIÓN SOCIETARIA Y PROPIEDAD INTELECTUAL — Uruguay

> Prioridad alta. Hacer antes de lanzar públicamente y generar ingresos.

### 1. Constituir SAS Unipersonal en Uruguay
- **Organismo:** AIN — Auditoría Interna de la Nación — ain.gub.uy
- **Tipo:** SAS (Sociedad por Acciones Simplificada) Unipersonal
- **Tiempo:** 5–10 días hábiles, trámite online
- **Costo:** bajo
- **Nota:** El titular de la marca y los derechos debe ser la sociedad, no la persona física

### 2. Registrar la marca "Global Tariff Hub"
- **Organismo:** DNPI — Dirección Nacional de la Propiedad Industrial — dnpi.gub.uy
- **Clase internacional:** Clase 42 (servicios tecnológicos, SaaS, plataformas digitales)
- **Costo aproximado:** USD 200–400
- **Tiempo:** 6–12 meses
- **Cobertura:** Uruguay es miembro del Convenio de Berna — reconocimiento en +170 países (toda la UE, EEUU, LATAM)

### 3. Registrar el software como obra intelectual
- **Organismo:** MEC — Ministerio de Educación y Cultura / Biblioteca Nacional del Uruguay
- **Qué depositar:** copia del código fuente + documentación
- **Protege:** el código como obra intelectual original
- **Evidencia adicional:** guardar commits de git con fechas, emails, facturas de hosting desde junio 2025

### 4. Orden recomendado
1. Constituir la SAS → titular de todo lo que sigue
2. Registrar marca en DNPI
3. Registrar software en MEC
4. Actualizar los Términos de Uso con razón social uruguaya

---

## 📋 PENDIENTES LEGALES Y COMERCIALES — Al escalar

> Activar cuando GTH tenga ingresos recurrentes o supere los 500 usuarios activos mensuales.

### 1. Contactar TAXUD — Acuerdo formal uso TARIC
- **Contacto:** TAXUD-DDS-TARIC@ec.europa.eu
- **Motivo:** Confirmar uso comercial de datos TARIC en plataforma SaaS
- **Qué pedir:** Licencia de uso para redistribución parcial en consultas puntuales
- **Preparar:** descripción de GTH, volumen de usuarios, forma en que se usan los datos

### 2. Plan pago WTO API
- **URL:** https://apiportal.wto.org
- **Motivo:** El plan gratuito tiene rate limits — al escalar pueden cortarse las consultas
- **Acción:** Revisar planes disponibles y costos según volumen de llamadas

### 3. Redactar Términos de Uso formales
- **Con asesor legal** (no solo IA)
- **Incluir obligatoriamente:**
  - GTH es intermediario de consulta, no redistribuidor de bases de datos
  - Los datos son de referencia — el usuario verifica con organismos oficiales
  - GTH no emite documentos aduaneros ni certificados de ningún tipo
  - Fuentes utilizadas y sus licencias
  - Limitación de responsabilidad
  - Jurisdicción aplicable

---
