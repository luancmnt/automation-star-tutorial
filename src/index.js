const path = require('path');
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');

const app = express();
const PORT = process.env.PORT || 3000;
const openapiPath = path.join(__dirname, '..', 'openapi.yaml');
const openapiDocument = YAML.load(openapiPath);

app.use(express.json());

app.get('/openapi.yaml', (req, res) => {
  res.type('application/yaml').sendFile(openapiPath);
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.use('/', authRoutes);
app.use('/', cartRoutes);
app.use('/', checkoutRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`E-commerce checkout API running on http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/docs`);
    console.log(`OpenAPI YAML: http://localhost:${PORT}/openapi.yaml`);
  });
}

module.exports = app;
