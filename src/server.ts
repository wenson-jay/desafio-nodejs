import fastifySwagger from '@fastify/swagger';
import fastifyApiReference from '@scalar/fastify-api-reference';
import fastify from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './config/env.ts';
import { createCourseRoute } from './routes/create-course.ts';
import { getCourseByIdRoute } from './routes/get-course-by-id.ts';
import { getCoursesRoute } from './routes/get-courses.ts';

const app = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
        ignore: 'pid,hostname',
      },
    },
  },
}).withTypeProvider<ZodTypeProvider>();

if (env.NODE_ENV === 'development') {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Desafio Node.js API',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifyApiReference, {
    routePrefix: '/docs',
  });
}

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get('/health', () => {
  return 'ok';
});

app.register(getCoursesRoute);
app.register(getCourseByIdRoute);
app.register(createCourseRoute);

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(() => {
    app.log.info(`Server running on port ${env.PORT}`);
  });
