import { baseProcedure } from "../base";

export const getCurrentUser = baseProcedure.handler(async ({ context }) => {
  return context.session?.user || null;
});
