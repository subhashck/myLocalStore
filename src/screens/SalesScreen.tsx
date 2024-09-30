import { TCategoryList, TInvoiceItems, TItems } from "../utils/types"
import ItemComponent from "../components/ItemComponent"
import { useEffect, useReducer, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CartModal from "@/components/CartModal";
import supabase from "@/utils/supabase";
import { useToast } from "@/hooks/use-toast";
import SalesPaymentScreen from "./SalesPaymentScreen";

function SalesScreen() {

    const { toast } = useToast()

    const [isPaymentMode, setIsPaymentMode] = useState(false)
    const [saleItems, setSaleItems] = useState<TInvoiceItems[] | undefined>(undefined)
    const [paymentMode, setPaymentMode] = useState(false)

    const [items, setItems] = useState<TItems[]|undefined>(undefined)

    const [categories, setCategories] = useState<TCategoryList[]>()

    const getItems = async () => {
        const { data, error } = await supabase
            .from('items')
            .select('id, itemName, categoryId, itemCategories(categoryName), forSale,forStock, units: itemUnits (id,unitName, factor, costPrice, salePrice) ')
        if (!error) {
            // console.log(data)
            // @ts-ignore
            setItems(data)
        } else  {
            toast({
                variant: 'destructive',
                description: 'Error while fatching list of items: ' + error.message
            })
        }
    }

    const getCategories = async () => {
        const { data } = await supabase
            .from('itemCategories')
            .select('id, categoryName')
        // .eq('id', '')
        data && setCategories(data)
    }

    // const [filterCategories, setFilterCategories] = useState(new Set([""]));

    // const [billedAmount, setBilledAmount] = useState(800)
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
        if (isPaymentMode) setIsPaymentMode(false)
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

    const clearSales = () => {
        setSaleItems(undefined)
        setItemsCount(0)
    }

    const getTotalBilledAmount = () => {
        const sum = saleItems?.reduce((accumulator: number, currentValue) => accumulator + (currentValue.price * currentValue.quantity), 0);
        return sum ? sum : 0
    }

    //force re-render
    const [, forceUpdate] = useReducer(x => x + 1, 0)

    useEffect(() => {
        getItems()
        getCategories()
    }, [])

    return (
        <div className="flex flex-col  px-2 max-w-sm mx-auto">
            {paymentMode && <SalesPaymentScreen cartDetails={saleItems} totalAmount={getTotalBilledAmount()}/>}
            {paymentMode?'Yes':'No'}
            <div className="grid grid-rows-2 gap-2 w-full mx-auto mt-5 mb-5">
                {/* {saleItems?.map((item, index) => {return <div>{item.item} {item.quantity}</div>})} */}
                <div className="grid grid-cols-2 gap-1 items-center">
                    {saleItems ?
                        <CartModal cartDetails={saleItems}
                            deleteSalesItem={(index) => deleteSalesItem(index)}
                            updateItem={(index, newQuantityType) => updateItem(index, newQuantityType)}
                            updateItemUnit={(indexSales, indexItemUnit) => updateItemUnit(indexSales, indexItemUnit)} 
                            setPaymentMode={(paymentMode)=>setPaymentMode(paymentMode)}/>
                        : <span className="text-sm italic  rounded-lg text-center items-center">No items in cart</span>}

                    <div className="font-semibold">Total Amount: {getTotalBilledAmount()} ₹</div>
                </div>
                <Select>
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
                <Input placeholder="Filter by Item Name" />
            </div>
            
            {items && items.map((item, index) => {
                return <div key={index} className="flex flex-col mb-2">
                    <ItemComponent item={item} addItem={addItem} index={index+1} typeScreen='Sales' />
                </div>
            })}

        </div >
    )
}
export default SalesScreen