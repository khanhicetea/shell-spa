import { getAuthConfig } from "./init";
import { getDatabase } from "../db/init";

export const auth = getAuthConfig(getDatabase(process.env.DATABASE_URL!));
