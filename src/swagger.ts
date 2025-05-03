import { Express } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: { title: "AIM Backend API", version: "1.0.0", description: "API for AIM Crypto" },
    servers: [{ url: "http://localhost:5001/api/v1" }]
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"]
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(specs));
};
