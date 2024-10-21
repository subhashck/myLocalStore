import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TCategoryList } from "@/utils/types"
import { useEffect, useState } from "react"
import supabase from "@/utils/supabase"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { LoaderIcon, TrashIcon } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"

const formSchema = z.object({
    id: z.coerce.number().gt(0).optional(),
    itemName: z.string().min(2, {
        message: "Item Name must be at least 2 characters.",
    }),
    categoryId: z.coerce.number({ message: "Category is required" }).gte(0),
    forSale: z.boolean(),
    forStock: z.boolean(),
    units: z.array(z.object({
        id: z.coerce.number().gt(0).optional(),
        unitName: z.string().min(1),
        factor: z.coerce.number().gt(0),
        costPrice: z.coerce.number().gt(0),
        salePrice: z.coerce.number().gt(0)
    }))
})

function ItemScreen({ mode }: { mode?: string }) {

    let { itemId } = useParams();

    const [categories, setCategories] = useState<TCategoryList[]>()
    const [deleteUnits, setDeleteUnits] = useState<number[]>([-1])
    const [loading, setLoading] = useState(mode === 'edit' ? true : false)

    const getCategories = async () => {
        // await sleep(10000)
        const { data, error } = await supabase
            .from('itemCategories')
            .select('id, categoryName')
        // .eq('id', '')
        if (data) {
            setCategories(data)
            if (mode === 'edit') setLoading(false)
        }
        else {
            setLoading(false)
            toast({
                variant: 'destructive',
                description: 'Error fetching from Database: ' + error.message
            })
            // throw Error("Unable to set Categories: " +  error)
        }
    }

    //get item from id for VIEW & EDIT modes
    const getSingleItem = async () => {
        const { data, error } = await supabase
            .from('items')
            .select('id, itemName, forSale, forStock, categoryId')
            .eq('id', itemId)
            .single()

        if (error) {
            setLoading(false)
            toast({
                variant: 'destructive',
                description: 'Error fetching from Database: ' + error.message
            })
            return
        }
        // console.info(data)
        form.setValue('id', data?.id)
        form.setValue('itemName', data?.itemName)
        form.setValue('categoryId', data?.categoryId)
        form.setValue('forSale', data?.forSale)
        form.setValue('forStock', data?.forStock)
        // form.setValue('units',data?.units?)
    }

    const getItemUnits = async () => {
        const { data, error } = await supabase
            .from('itemUnits')
            .select('id, unitName, factor, costPrice, salePrice')
            .eq('itemId', itemId)

        if (error) {
            setLoading(false)
            toast({
                variant: 'destructive',
                description: 'Error fetching from Database: ' + error.message
            })
            return
        }
        // console.info(data)
        if (data.length > 0) form.setValue('units', data)

        setLoading(false)
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            itemName: "",
            forSale: false,
            forStock: false,
            units: [{
                unitName: 'PCS',
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

    //handle delete from screen as well as delete from database
    const deleteUnit = (index: number) => {
        // console.log('to delete: ',form.getValues('units'))
        if (mode === 'edit') {
            const listDelete = [...deleteUnits]
            const units = form.getValues('units')
            const id = units[index].id
            if (id) listDelete.push(id)
            // console.log('to delete', id)
            setDeleteUnits(listDelete)
        }
        remove(index)
    }

    const { isSubmitting } = form.formState

    // submit handler.
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        // await sleep(10000)
        // console.log(values)
        const { id, itemName, categoryId, forStock, forSale, units } = values

        const itemUpper = itemName.toUpperCase()

        const record = {
            itemName: itemUpper, categoryId, forStock,
            forSale
        }

        if (id) {
            // @ts-ignore
            record.id = id
        }

        const { data, error } = await supabase
            .from('items')
            .upsert(record)
            .select('id')
            .single()

        if (error) {
            console.error('Error while saving new Item: ' + error.message)
            toast({
                variant: "destructive",
                title: 'Error',
                description: 'Problem while saving new Item: ' + itemName + ' ' + error.message
            })
            return
        } else if (data) {
            //insert into item ubits
            let toInsert = [{}]
            let toUpdate = [{}]
            toInsert.splice(0, 1)
            toUpdate.splice(0, 1)
            units.forEach(element => {
                if (element.id) {
                    toUpdate.push({
                        id: element.id,
                        itemId: data.id,
                        unitName: element.unitName.toUpperCase(),
                        factor: element.factor,
                        costPrice: element.costPrice,
                        salePrice: element.salePrice
                    })
                } else {
                    toInsert.push({
                        itemId: data.id,
                        unitName: element.unitName.toUpperCase(),
                        factor: element.factor,
                        costPrice: element.costPrice,
                        salePrice: element.salePrice
                    })
                }

            });

            // console.log('insert ',toInsert)
            const updateUnits = await supabase
                .from('itemUnits')
                .upsert(toUpdate)
            const insertUnits = await supabase
                .from('itemUnits')
                .insert(toInsert)

            //database delete of units
            const del = await supabase
                .from('itemUnits')
                .delete()
                .in('id', deleteUnits)
            if (del.error) {
                console.error('Error while deleting units ', del.error)
                toast({
                    variant: "destructive",
                    title: 'Error',
                    description: 'Error while deleting units: ' + del.error.message
                })
                return
            }

            if (updateUnits.error) {
                console.error('Error while updating units ', updateUnits.error)
                toast({
                    variant: "destructive",
                    title: 'Error',
                    description: 'Error while updating units: ' + updateUnits.error.message
                })
                return
            }
            if (insertUnits.error) {
                console.error('Error while saving creating units  ', insertUnits.error)
                toast({
                    variant: "destructive",
                    title: 'Error',
                    description: 'Error while creating units: ' + insertUnits.error.message
                })
                if (!mode) {
                    const deleteItem = await supabase
                        .from('items')
                        .delete()
                        .eq('id', data.id)
                    if (deleteItem.error) {
                        console.error('Error while rolling back item ', deleteItem.error)
                        toast({
                            variant: "destructive",
                            title: 'Error',
                            description: 'Error while rolling back item: ' + deleteItem?.error.message
                        })
                        return
                    }
                }
                return
            }
        }
        navigate("/items")
        toast({
            description: "Item saved successfully..",
        })
    }

    //hooks
    const { toast } = useToast()
    const navigate = useNavigate();

    const onLoad = async() => {
        setLoading(true)
        await getCategories()
        if (mode === 'edit') {
            await getSingleItem()
            await getItemUnits()
        }
        setLoading(false)
    }

    useEffect(() => {
        onLoad()
        // else if (!mode) form.setValue('categoryId',"")
    }, [])

    if(loading){
        return (<div className="flex flex-col items-center">
          <LoaderIcon className="animate-spin my-5" />
          <p className="animate-bounce">Loading data ...</p>
        </div>)
      }
    
    return (
        <div className="max-w-sm mx-auto px-1">

            <section className="mb-5">
                <div className="text-center text-xs">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link to="/">Home</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link to="/items">Items</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{mode ? mode.toUpperCase() : 'New'} Item</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="text-center text-xl"> {mode ? mode.toUpperCase() : 'Create New'} Item</div>
            </section>
            {/* {loading && <LoaderIcon className="animate-spin mx-auto" />} */}
            {/* { JSON.stringify(deleteUnits)}  */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col  gap-5 px-2 ">
                    <FormField
                        control={form.control}
                        name="itemName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Name of Item" {...field} disabled={mode === "edit"}/>
                                </FormControl>
                                <FormDescription>
                                    This is your name of your item.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value?.toString()} >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a Category" />
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

                    <div className="  dark:bg-blue-300 py-1">
                        <div className="flex flex-col w-full  place-items-center">
                            <Button type="button" variant="outline" onClick={() => append({
                                unitName: "",
                                factor: 0,
                                costPrice: 0,
                                salePrice: 0
                            })}>
                                + Add More Units
                            </Button>
                        </div>

                        <div className="h-[25vh] overflow-scroll ">

                            {fields.map((field, index) => {
                                return (
                                    <div key={field.id} className="grid grid-cols-10 gap-x-1 !mt-1 px-2 pb-2">
                                        <FormField
                                            control={form.control}
                                            name={`units.${index}.unitName`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-3">
                                                    <FormLabel className={cn(index !== 0 && "sr-only")}>Unit Name</FormLabel>
                                                    <Input className="text-xs" placeholder="Unit name" {...field}  />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`units.${index}.factor`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
                                                    <FormLabel className={cn(index !== 0 && "sr-only")}> Factor</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className=" max-w-32" placeholder="Factor of Conversion" {...field}  />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name={`units.${index}.costPrice`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2 ">
                                                    <FormLabel className={cn(index !== 0 && "sr-only")}>Cost</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" className="max-w-32" placeholder="Cost Price" {...field} />
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
                                                        <Input type="number" className="max-w-32" placeholder="Sale price" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="inline-flex justify-end">
                                            {(index !== 0) && <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-700"
                                                onClick={() => deleteUnit(index)}
                                            >
                                                <TrashIcon />
                                            </Button>
                                            }
                                        </div>
                                    </div>)
                            })}
                        </div>
                    </div>
                    <Button type="submit" className="bg-green-700" disabled={isSubmitting||loading}> {isSubmitting||loading ? <LoaderIcon className="animate-spin"/> : 'Save'}</Button>
                    <Button type="button" variant="ghost" onClick={() => {
                        form.reset()
                        if (mode === 'edit') {
                            getSingleItem()
                            getItemUnits()
                        }
                    }
                    }>Reset</Button>
                </form>
            </Form>
        </div>
    )
}

export default ItemScreen