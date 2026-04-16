INSTRUCCIONES PARA UNA WEB APP DE FACTURACIÓN


Se necesita crear una web app de facturación donde el usuario ingrese:


Name :  El nombre de la factura o gasto . Por ejemplo : Internet, Servicios públicos , tarjeta de crédito

Proveedor : Este debe ser un campo de selección con los siguiente proveedores: Tigo, Soi, Mastercard, EPM, Carulla. 

Valor : El valor de la factura

Fecha_Vence: La fecha en que se vence la factura con el formato dia/mes/año 

Doc : Campo "attach" donde se adjunta la imagen, pdf de la factura. 


Estos datos deben ser ingresado a una tabla de Airtable llamada Facturas. Debes añadir las variables de entorno tanto local com el .env y yo luego coloco los valores reales de la API key de Airtable. 

El diseño debe ser sobrio , elegante y "responsive" . Usa colores pastel del azul y el verde. 

Trabaja con Next.js. 

Aplica los principios SOLID , clean code, DRY y que ningún componente exceda los 200 líneas de código.
