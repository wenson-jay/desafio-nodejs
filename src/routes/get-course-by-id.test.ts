import { faker } from '@faker-js/faker';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../app.ts';
import { makeCourse } from '../tests/factories/make-course.ts';

describe('Get course by id e2e', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('obter detalhes de um curso especifico com sucesso', async () => {
    const course = await makeCourse();

    const response = await request(app.server)
      .get(`/courses/${course.id}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      course: {
        id: expect.any(String),
        title: expect.any(String),
        description: expect.any(String),
      },
    });
  });

  it('obter detalhes de um curso especifico que nao existe', async () => {
    const response = await request(app.server)
      .get(`/courses/${faker.string.uuid()}`)
      .send();

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      message: 'Curso não encontrado',
    });
  });
});
