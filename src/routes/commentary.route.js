import { Router } from "express";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { matchIdParamSchema } from "../validations/matches.validation.js";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from "../validations/commentary.validation.js";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";

export const commentaryRouter = Router({ mergeParams: true });

commentaryRouter.get("/", async (req, res) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid match id", details: paramsResult.error.issues });
  }
  const queryResult = listCommentaryQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    return res
      .status(400)
      .json({
        error: "Invalid query parameters",
        details: queryResult.error.issues,
      });
  }
  try {
    const limit = queryResult.data.limit || 100;
    const data = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, paramsResult.data.id))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

commentaryRouter.post("/", async (req, res) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid match id", details: paramsResult.error.issues });
  }
  const bodyResult = createCommentarySchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: bodyResult.error.issues });
  }
  try {
    console.log(bodyResult.data);
    console.log(paramsResult.data);
    const result = await db
      .insert(commentary)
      .values({
        matchId: paramsResult.data.id,
        ...bodyResult.data,
      })
      .returning();

    res.status(201).json({ data: result[0] });
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});
