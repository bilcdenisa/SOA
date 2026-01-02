import Joi from "joi";

export const spotUpdateSchema = Joi.object({
  status: Joi.string().valid("OCCUPIED", "FREE").required()
});
