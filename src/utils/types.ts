import { z } from "zod";

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
    itemId?: number,
    itemName: string,
    unit: string,
    price: number,
    quantity: number,
    units: TUnit[]
}


export type TCategoryList = {
    id: number,
    categoryName: string
}

export type TSaleListItem = {
    id: number,
    customer: string,
    invoiceDate: string,
    status: string,
    billedAmount: number,
    discount: number,
    payableAmount: number,
    paidUpi: number,
    paidCash: number,
    totalPaid: number
}

export type TVendorListItem = {
    id: number,
    vendorName: string,
    vendorAddress: string,
    vendorPhone:number,
    invoiceDate: string,
    status: string,
    billedAmount: number,
    discount: number,
    payableAmount: number,
    paidUpi: number,
    paidCash: number,
    totalPaid: number
}

export const vendorSchema = z.object({
    id: z.number().optional(),
    vendorName: z.string({message: 'Name is required'}).min(5, { message: 'Name should be atleast 5 characters' }),
    vendorAddress: z.string().optional(),
    vendorPhone: z.coerce.number({message:'Phone no is 10 digits'}).gte(1000000000, { message: 'Phone no is 10 digits' }).lte(9999999999, { message: 'Phone no is 10 digits' }).optional(),
})

export type TVendor = z.infer<typeof vendorSchema>