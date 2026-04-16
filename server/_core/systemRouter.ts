import { publicProcedure, router } from "./trpc";
import { z } from "zod";

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({ ok: true })),
});
