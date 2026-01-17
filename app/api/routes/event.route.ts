import { IngestionEventController } from "../controller/event.controller";
import { Hono } from "hono";

const router = new Hono()

router.post('/', IngestionEventController)

export default router