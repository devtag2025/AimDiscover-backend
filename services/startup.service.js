import { Pool } from "@neondatabase/serverless";

export class StartupService {
  static #initialized = false;
  static #server;
  static #dbPool;

  static async initialize(app, env) {
    if (this.#initialized) return;
    this.#initialized = true;

    // Test database connection
    try {
      this.#dbPool = new Pool({ connectionString: process.env.DATABASE_URL || env.DATABASE_URL });
      const result = await this.#dbPool.query('SELECT NOW()');
      console.log('Database connected:', result.rows[0]);
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }

    this.#server = app.listen(env.PORT, () =>
      console.log(`Server running on http://localhost:${env.PORT}`)
    );

    ["SIGINT", "SIGTERM"].forEach((signal) =>
      process.on(signal, async () => {
        console.log(`Received ${signal}, shutting down...`);
        await this.shutdown();
        process.exit(0);
      })
    );
  }

  static async shutdown() {
    if (this.#server) {
      await new Promise((resolve, reject) =>
        this.#server.close((err) => (err ? reject(err) : resolve()))
      );
    }
    if (this.#dbPool) {
      await this.#dbPool.end();
    }
    console.log("Shutdown complete");
  }
}

export default StartupService;
