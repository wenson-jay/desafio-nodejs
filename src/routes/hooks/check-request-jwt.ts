import type { FastifyReply, FastifyRequest } from 'fastify';

export async function checkRequestJWT(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    await request.jwtVerify({
      algorithms: ['RS256'],
    });
    // biome-ignore lint/correctness/noUnusedVariables: <ignore error type>
  } catch (error) {
    throw reply.status(401).send();
  }
}
