import { z } from "zod"

const formSchema = z.object({
  // customerType: z.enum(['Retail', 'Customer']),
  // customerName: z.string().optional(),
  // cart: cartSchema,
  totalAmount: z.coerce.number().gte(0),
  discount: z.coerce.number().gt(0),
  paidUpi: z.coerce.number().gte(0).lte(2222),
  paidCash: z.coerce.number().gte(0).lte(2222),
})
  .superRefine((val, ctx) => {
    // console.log('issue with validation', val)
    if ((val.totalAmount - val.discount) !== (val.paidCash + val.paidUpi)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "paid amount is incorrect",
        // type: 'custom',
        path: ['paidCash']
      })
    }

  }
  )

const input = {
  totalAmount: 2000,
  discount: 20,
  paidUpi: 1980,
  paidCash: 110
}

const test = formSchema.parse(input)

// console.log(test)