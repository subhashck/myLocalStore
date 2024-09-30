// import { z } from "zod";

export type TUnit = {
    unitName: string,
    factor: number,
    costPrice: number,
    salePrice: number
}
export type TItems = {
    id?: number,
    itemName: string,
    categoryId?: string,
    itemCategories?: { categoryName: string },
    forStock: boolean,
    forSale: boolean,
    units: TUnit[]
}

// export type TItemsBasic = Omit<TItems,'units'>

export type TInvoiceItems = {
    item: string,
    unit: string,
    price: number,
    quantity: number,
    units: TUnit[]
}


export type TCategoryList = {
    id: number,
    categoryName: string
}

// export const newItemSchema = z.object({
//     itemName: z.string().min(2, {
//         message: "Item name must be at least 2 characters.",
//     }),
    // categoryId: z.coerce.number(),
    // brandId: z.coerce.number().nullable(),
    // forSale: z.boolean(),
    // forStock: z.boolean(),
    // units: z.array(z.object({
    //     unitName: z.string().min(1),
    //     factor: z.coerce.number().gt(0),
    //     costPrice: z.coerce.number().gt(0),
    //     salePrice: z.coerce.number().gt(0)
    // }))
// })

// export type TItemFormFields = z.infer<typeof newItemSchema>