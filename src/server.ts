import { app } from './app.ts';
import { env } from './config/env.ts';

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(() => {
    app.log.info(`Server running on port ${env.PORT}`);
  });
