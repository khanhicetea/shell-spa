import type { Pool } from "pg";

export const registerQueryTimeLogging = (pool: Pool) => {
  const originalQuery = pool.query.bind(pool);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pool.query = (...args: any[]): any => {
    const startTime = Date.now();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryText =
      typeof args[0] === "string"
        ? args[0]
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (args[0] as any)?.text || "Unknown query";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultPromise = originalQuery(
      ...(args as [any, any]),
    ) as Promise<any>;

    return resultPromise
      .then((res: unknown) => {
        const duration = Date.now() - startTime;
        console.log(
          `Query: ${queryText.substring(0, 50)}... took ${duration}ms`,
        );
        return res;
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        console.error(`Query: ${queryText} took ${duration}ms`);
        throw error;
      });
  };
};
