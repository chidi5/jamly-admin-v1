import { Paystack } from "paystack-sdk";

export const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY ?? "");
