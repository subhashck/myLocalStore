import { TCategoryList, TInvoiceItems, TItems } from "../utils/types"
import ItemComponent from "../components/ItemComponent"
import { useEffect, useReducer, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CartModal from "@/components/CartModal";
import supabase from "@/utils/supabase";
import { useToast } from "@/hooks/use-toast";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PurchasePaymentComponent from "@/components/PurchasePaymentComponent";

function PurchaseScreen() {

    const { toast } = useToast()

    // const [isPaymentMode, setIsPaymentMode] = useState(false)
    const [saleItems, setSaleItems] = useState<TInvoiceItems[] | undefined>(undefined)

    //flag to enable payment screen
    const [paymentMode, setPaymentMode] = useState(false)

    const [items, setItems] = useState<TItems[] | undefined>(undefined)
    const [itemList, setItemsList] = useState<TItems[] | undefined>(undefined)
    const [filterValue, setFilterValue] = useState("");
    const [filterCategory, setFilterCategory] = useState('')
    const [categories, setCategories] = useState<TCategoryList[]>()
    const [loading, setLoading] = useState(true)

    const getItems = async () => {
        const { data, error } = await supabase
            .from('items')
            .select('id, itemName, categoryId, itemCategories(categoryName), forSale,forStock, units: itemUnits (id,unitName, factor, costPrice, salePrice) ')
        if (!error) {
            // console.log(data)
            // @ts-ignore
            setItems(data)
            // @ts-ignore
            setItemsList(data)
        } else {
            setLoading(false)
            toast({
                variant: 'destructive',
                description: 'Error while fatching list of items: ' + error.message
            })
        }
    }

    const getCategories = async () => {
        // await sleep(10000)
        const { data, error } = await supabase
            .from('itemCategories')
            .select('id, categoryName')
        if (data) {
            setCategories(data)
            setLoading(false)
        }
        else {
            setLoading(false)
            toast({
                variant: 'destructive',
                description: 'Error fetching from Database: ' + error.message
            })
            // throw Error("Unable to set Categories: " +  error)
        }
        // console.log('Categories is: ', data)
    }

    const [itemsCount, setItemsCount] = useState(0)


    const addItem = (item: TInvoiceItems) => {
        // console.log('sdsd: ', item)
        if (item) {
            const oldItems = saleItems
            if (oldItems === undefined) {
                setSaleItems([item])
            } else {
                oldItems.push(item)
                setSaleItems(oldItems)
            }
        }
        const count = itemsCount + 1
        setItemsCount(count)
        // if (isPaymentMode) setIsPaymentMode(false)
        // onOpen()
    }

    const updateItemUnit = (indexSales: number, indexItemUnit: number) => {
        let oldItems = saleItems
        if (oldItems) {
            oldItems[indexSales].price = oldItems[indexSales].units[indexItemUnit].salePrice
            oldItems[indexSales].unit = oldItems[indexSales].units[indexItemUnit].unitName
            // console.log(oldItems)
            setSaleItems(oldItems)
            forceUpdate()
            // setIsPopOpen(false)
        }
    }

    const deleteSalesItem = (index: number) => {
        if (saleItems !== undefined) {
            const prevSaleItems: TInvoiceItems[] = [...saleItems]
            prevSaleItems.splice(index, 1)
            setSaleItems(prevSaleItems)
            const count = itemsCount - 1
            setItemsCount(count)
        }
    }

    const updateItem = (index: number, newQuantityType: 'Inc' | 'Dec') => {
        let oldItems = saleItems
        if (oldItems) {
            if (newQuantityType === 'Inc') oldItems[index].quantity++
            else {
                oldItems[index].quantity > 0 ? oldItems[index].quantity-- : oldItems[index].quantity
            }

            setSaleItems(oldItems)
            forceUpdate()
        }
    }

    // const clearSales = () => {
    //     setSaleItems(undefined)
    //     setItemsCount(0)
    // }

    const getTotalBilledAmount = () => {
        const sum = saleItems?.reduce((accumulator: number, currentValue) => accumulator + (currentValue.price * currentValue.quantity), 0);
        return sum ? sum : 0
    }

    //start of filter logic
    const resetFilters = () => {
        setItemsList(items)
        setFilterValue('')
        setFilterCategory('')
    }

    const onItemFilterChange = (value: string) => {
        setFilterCategory('')
        setFilterValue(value);
        const filteredItems = items?.filter((a: any) => a.itemName.includes(value.toUpperCase()))
        setItemsList(filteredItems)
    }

    const onCategoryFilterChange = (val: string) => {
        setFilterCategory(val)
        setFilterValue('');
        if (val) {
            const filteredItems = items?.filter((a: any) => a.categoryId === Number(val))
            setItemsList(filteredItems)
        } else {
            setItemsList(items)
        }
    }

    //force re-render
    const [, forceUpdate] = useReducer(x => x + 1, 0)

    useEffect(() => {
        getItems()
        getCategories()
    }, [])

    return (
        <div className="flex flex-col  px-2 max-w-sm mx-auto pb-5">
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
                            <BreadcrumbLink asChild>
                                <Link to="/expenses">Expenses</Link>
                            </BreadcrumbLink>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>New Expense</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="text-center text-xl">{paymentMode ? 'Vendor Payment' : 'Create Purchase Bill'}</div>
            </section>
            <div className="mx-auto">{loading && <LoaderIcon className="animate-spin" />}</div>
            {paymentMode && <PurchasePaymentComponent cartDetails={saleItems} totalAmount={getTotalBilledAmount()} setPaymentMode={(paymentMode) => setPaymentMode(paymentMode)} />}
            {!paymentMode &&
                <div className="grid grid-rows-2 gap-2 w-full mx-auto  mb-5">
                    <div className="grid grid-cols-2 gap-1 items-center">
                        {saleItems ?
                            <CartModal cartDetails={saleItems}
                                deleteSalesItem={(index) => deleteSalesItem(index)}
                                updateItem={(index, newQuantityType) => updateItem(index, newQuantityType)}
                                updateItemUnit={(indexSales, indexItemUnit) => updateItemUnit(indexSales, indexItemUnit)}
                                setPaymentMode={(paymentMode) => setPaymentMode(paymentMode)} />
                            : <span className="text-sm italic  rounded-lg text-center items-center">No items in cart</span>}

                        <div className="font-semibold">Total Amount: {getTotalBilledAmount()} ₹</div>
                    </div>
                    <Select onValueChange={(val) => onCategoryFilterChange(val)} value={filterCategory}>
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
                    </Select>
                    <Input placeholder="Filter by Item Name" value={filterValue}
                        onChange={(e) => onItemFilterChange(e.target.value)} />
                    <Button variant="secondary" onClick={() => resetFilters()}>Clear Filter</Button>
                </div>
            }
            {!paymentMode && itemList && itemList.map((item, index) => {
                return <div key={index} className="flex flex-col mb-2">
                    <ItemComponent item={item} addItem={addItem} index={index + 1} typeScreen='Purchase' />
                </div>
            })}


        </div >
    )
}
export default PurchaseScreen