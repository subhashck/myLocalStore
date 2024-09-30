import { useEffect, useState } from "react";
import { newItemSchema, TCategoryList, TItemFormFields } from "../utils/types";
import supabase from "../utils/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrashIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Form, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

function ItemScreen() {

    // const initUnit: TUnit = { unitName: '', factor: 1, costPrice: 0, salePrice: 0 }
    // const [unitList, setUnitList] = useState<TUnit[]>([initUnit])

    // const [item, setItem] = useState('')
    // const [category, setCategory] = useState<number>()
    // const [forSale, setForSale] = useState(false)
    // const [forStock, setForStock] = useState(false)
    const [categories, setCategories] = useState<TCategoryList[]>()

    const form = useForm<TItemFormFields>({
        resolver: zodResolver(newItemSchema),
        defaultValues: {
            itemName: 'aa',
            categoryId: 0,
            brandId: null,
            forSale: false,
            forStock: false,
            units: [{
                unitName: 'pcs',
                factor: 1,
                costPrice: 0,
                salePrice: 0
            }]
        },
    })

    const { fields, append, remove } = useFieldArray({
        name: "units",
        control: form.control
    })

    const { isSubmitting } = form.formState

    const onSubmit = async (values: TItemFormFields) => {
        console.log(values)
    }

    // const addUnit = () => {
    //     const tempUnitList: TUnit[] = [...unitList, initUnit]
    //     setUnitList(tempUnitList)
    // }

    // const delUnit = (index: number) => {
    //     if (index === 0) return
    //     const prevUnits = [...unitList]
    //     prevUnits.splice(index, 1)
    //     setUnitList(prevUnits)
    // }

    // const updateUnits = (index: number, unitName: string) => {
    //     const prevUnits = [...unitList]
    //     prevUnits[index].unitName = unitName
    //     setUnitList(prevUnits)
    // }

    // const updateFactor = (index: number, factor: number) => {
    //     const prevUnits = [...unitList]
    //     prevUnits[index].factor = factor
    //     setUnitList(prevUnits)
    // }

    // const updateCost = (index: number, cost: number) => {
    //     const prevUnits = [...unitList]
    //     prevUnits[index].costPrice = cost
    //     setUnitList(prevUnits)
    // }

    // const updateSale = (index: number, sale: number) => {
    //     const prevUnits = [...unitList]
    //     prevUnits[index].salePrice = sale
    //     setUnitList(prevUnits)
    // }

    const getCategories = async () => {
        const { data } = await supabase
            .from('itemCategories')
            .select('id, categoryName')
        // .eq('id', '')
        data && setCategories(data)
    }

    // const saveItem = async () => {

    //     console.log(item, category)

    //     const { data, error } = await supabase
    //         .from('items')
    //         .insert([
    //             { itemName: item, forSale, forStock, categoryId: category },
    //         ])
    //     if (error) console.error(error)
    //     console.info(data)

    // }

    useEffect(() => {
        getCategories()
    }, [])

    return (
        <div className="max-w-sm mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col  gap-5 px-2 ">
                        <FormField
                            control={form.control}
                            name="itemName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Item Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Name of Item' {...field} autoComplete="false" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a Catagory" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories?.map((category: TCategoryList) => {
                                                return (
                                                    <SelectItem key={category.id} value={category.id.toString()}>{category.categoryName}</SelectItem>
                                                )
                                            })}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="forSale"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between  px-2 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>For Sale?</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="forStock"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between  px-2 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Stock to be mantained?</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* <Input value={item} placeholder="Item Name" onChange={(e) => setItem(e.target.value)} /> */}
                        {/* <Input value={item} placeholder="Brand Name" onChange={(e) => setItem(e.target.value)} /> */}
                        {/* <Select onValueChange={(val) => setCategory(Number(val))}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Item Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories?.map((category) => (
                                    <SelectItem key={category.id.toString()} value={category.id.toString()}>
                                        {category.categoryName}
                                    </SelectItem>
                                ))
                                }
                            </SelectContent>
                        </Select> */}

                        {/* <div className="flex justify-around">
                            <Label htmlFor="forStock">For Stock</Label><Switch id="forStock" />
                            <Label htmlFor="forSale">For Sale</Label><Switch id="forSale" />
                        </div> */}
                        <div className=" h-[55vh] overflow-scroll  dark:bg-blue-300 py-1">
                            <div className="flex flex-col w-full  place-items-center">
                                <Button variant="outline" onClick={() => append({
                                    unitName: "",
                                    factor: 0,
                                    costPrice: 0,
                                    salePrice: 0
                                })}>
                                    + Add More Units
                                </Button>
                            </div>

                            {fields.map((field, index) => {
                                return (
                                    <div key={field.id} className="grid grid-cols-9 gap-x-1 !mt-1 px-2 pb-2">
                                        <FormField
                                            control={form.control}
                                            name={`units.${index}.unitName`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-3">
                                                    <FormLabel className={cn(index !== 0 && "sr-only")}>Units</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={index === 0 } >
                                                        <FormControl>
                                                            <SelectTrigger >
                                                                <SelectValue placeholder="Select a unit" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="pcs" disabled>pcs</SelectItem>
                                                            <SelectItem value="Dozen">Dozen</SelectItem>
                                                            <SelectItem value="Cases">Cases</SelectItem>
                                                            <SelectItem value="Boxes">Boxes</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`units.${index}.factor`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className={cn(index !== 0 && "sr-only")}> Factor</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className="max-w-32"  {...field} disabled={index === 0 } />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`units.${index}.costPrice`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel className={cn(index !== 0 && "sr-only")}>Cost Price</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className="max-w-32" placeholder="Cost Price" {...field}  />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`units.${index}.salePrice`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel className={cn(index !== 0 && "sr-only")}>Sale Price</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className="max-w-32" placeholder="Sale price" {...field}  />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="inline-flex justify-end">
                                            {(index !== 0) && <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-900"
                                                onClick={() => remove(index)}
                                            >
                                                <TrashIcon />
                                            </Button>
                                            }
                                        </div>


                                    </div>)
                            })}


                            {/* <div className="grid grid-cols-6 gap-x-2 items-center my-2 px-2 text-secondary-600 text-xs">
                                <div className="col-span-2">Unit Name</div>
                                <div>Factor</div>
                                <div>Cost Price</div>
                                <div>Sale Price</div>
                            </div>
                            {unitList.map((unit, index) => {
                                return <div className="grid grid-cols-6 gap-x-2 items-center my-2 px-1" key={index}>
                                    <Input className="col-span-2" value={unit.unitName} onChange={(val) => updateUnits(index, val.target.value)} />
                                    <Input type="number" value={unit.factor.toString()} onChange={(val) => updateFactor(index, Number(val))} />
                                    <Input type="number" value={unit.costPrice.toString()} onChange={(val) => updateCost(index, Number(val))} />
                                    <Input type="number" value={unit.salePrice.toString()} onChange={(val) => updateSale(index, Number(val))} />
                                    <Button variant="ghost" size="icon" className="text-re" onClick={() => delUnit(index)}>
                                        <Archive size="15" />
                                    </Button>
                                </div>;
                            })} */}
                        </div>


                    </div>


                    <footer className="right-5  px-5 mt-5 " >
                        <div className="flex flex-row justify-between mx-auto w-full">
                            <Button className="text-amber-600" onClick={() => { }} variant="ghost">
                                Reset
                            </Button>
                            <Button type="submit" className="text-green-600"  variant="outline" disabled={isSubmitting}>
                                Save Item
                            </Button>
                        </div>
                    </footer>
                </form>
            </Form>
        </div>
    )
}
export default ItemScreen


