import { useState } from "react"
import { Button } from "./ui/button"
import { TInvoiceItems, TItems } from "@/utils/types"
import { Check, ChevronRight, X } from "lucide-react"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { Cross1Icon, DashboardIcon } from "@radix-ui/react-icons"

function ItemComponent({ index, item, addItem, typeScreen }: {index?: number,  item: TItems, typeScreen: 'Purchase' | 'Sales' | 'Items', addItem?: (item: TInvoiceItems) => void }) {

    const [show, setShow] = useState(false)
    const addSalesItem = () => {
        // console.log('fn:addSalesItem ', item)
        if (addItem) {
            const itemAdd: TInvoiceItems = {
                item: item.itemName,
                unit: item.units[0].unitName,
                price: (typeScreen === 'Sales') ? item.units[0].salePrice : item.units[0].costPrice,
                units: item.units,
                quantity: 1
            }
            addItem(itemAdd)
        }

    }
    return (
        <div className="grid grid-row-2 gap-1  p-2 rounded-md shadow-lg border">
            <div className="flex justify-between gap-10 flex-1 items-center">
                <div className="flex flex-row gap-2">
                    <p>{index?index:item.id}</p>
                    <p className="text-md">{item.itemName}</p>
                </div>
                <div className="flex items-center">
                    <Button variant="ghost" size={"icon"} onClick={() => setShow(!show)}>
                        {show ?<Cross1Icon/> : <DashboardIcon/>}
                    </Button>
                    <Button variant={"ghost"} size={"icon"} onClick={addSalesItem}>
                        {typeScreen === 'Items' ? <Link to={"edit/"+item.id} >Edit</Link> : <ChevronRight />}
                    </Button>
                </div>
            </div>
            {show && <div className="flex flex-row justify-between">
                <div className="grid grid-cols-8  items-center gap-2">
                    <Badge
                        className=" bg-slate-700 col-span-4 " >
                        {item.itemCategories?.categoryName || item.categoryId}
                    </Badge>
                    <Badge
                        className={cn(item.forStock ? "bg-green-800" : "bg-red-600", "col-span-2")}>
                        Stock:{item.forStock ? <Check size={15} /> : <X size={15} />}
                    </Badge>
                    <Badge
                        className={cn(item.forSale ? "bg-green-800" : "bg-red-600", "col-span-2")}>
                        Sale: {item.forSale ? <Check size={15} /> : <X size={15} />}
                    </Badge>
                </div>
            </div>
            }
        </div>
    )
}
export default ItemComponent