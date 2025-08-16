import { fakerPT_BR as faker } from '@faker-js/faker';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../app.ts';

describe('Create course e2e', () => {
  //   beforeAll(async () => {});

  //   afterAll(async () => {});

  it('criar um curso com sucesso', async () => {
    await app.ready();

    const response = await request(app.server)
      .post('/courses')
      .set('Content-Type', 'application/json')
      .send({
        title: faker.lorem.word(6),
        description: faker.lorem.sentence(),
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      courseId: expect.any(String),
    });
  });
});
