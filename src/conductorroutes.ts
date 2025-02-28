import { Router } from "express";

export const conductorRouter = Router();

conductorRouter.get("/", (req, res) => {
  res.send("Conductor Home");
});