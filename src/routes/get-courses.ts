import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';
import { db } from '../database/client.ts';
import { courses } from '../database/schema.ts';

// biome-ignore lint/suspicious/useAwait: <>
export const getCoursesRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/courses',
    {
      schema: {
        tags: ['Courses'],
        summary: 'Lista de cursos',
        description: 'Retorna uma lista de cursos com id e titulo',
        operationId: 'getCourses',
        response: {
          200: z
            .object({
              courses: z.array(
                z.object({
                  id: z.string(),
                  title: z.string(),
                })
              ),
            })
            .describe('Lista de cursos com id e titulo com sucesso!'),
        },
      },
    },
    async (_request, reply) => {
      const result = await db
        .select({
          id: courses.id,
          title: courses.title,
        })
        .from(courses);

      return reply.status(200).send({ courses: result });
    }
  );
};
