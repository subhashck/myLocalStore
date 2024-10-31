import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { TInvoiceItems, TItems } from "@/utils/types"
import { Check, ChevronRight, LoaderIcon, X } from "lucide-react"
import { Link } from "react-router-dom"
import { Cross1Icon, DashboardIcon } from "@radix-ui/react-icons"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { useToast } from "@/hooks/use-toast"
import supabase from "@/utils/supabase"

type TUnitList = {
    id: number,
    unitName: string,
    factor: string,
    costPrice: number,
    salePrice: number
}

function ItemComponent({ index, item, addItem, typeScreen }: { index?: number, item: TItems, typeScreen: 'Purchase' | 'Sales' | 'Items', addItem?: (item: TInvoiceItems) => void }) {

    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(true)
    const [unitList, setUnitList] = useState<TUnitList[] | undefined>()

    const addSalesItem = () => {
        // console.log('fn:addSalesItem ', item)
        let i = 0
        if (typeScreen === 'Purchase') {
            i = item.units.length - 1
        }
        if (addItem) {
            const itemAdd: TInvoiceItems = {
                itemId: item.id,
                itemName: item.itemName,
                unit: item.units[i].unitName,
                price: (typeScreen === 'Sales') ? item.units[i].salePrice : item.units[i].costPrice,
                units: item.units,
                quantity: 1
            }
            addItem(itemAdd)
        }
    }

    const getItemUnits = async () => {
        const { data, error } = await supabase
            .from('itemUnits')
            .select('id, unitName, factor, costPrice, salePrice')
            .eq('itemId', item.id)

        if (error) {
            setLoading(false)
            toast({
                variant: 'destructive',
                description: 'Error fetching from Database: ' + error.message
            })
            return
        }
        setUnitList(data)
        // console.info(data)
        setLoading(false)
    }

    useEffect(() => {
        if (show) getItemUnits()
    }, [show])

    const { toast } = useToast()

    return (
        <div className="grid grid-row-2 gap-1  p-2 rounded-md shadow-lg border">
            <div className="flex justify-between gap-10 flex-1 items-center">
                <div className="flex flex-row gap-2">
                    <p>{index ? index : item.id}</p>
                    <p className="text-md">{item.itemName}</p>
                </div>
                <div className="flex items-center">
                    <Button variant="ghost" size={"icon"} onClick={() => setShow(!show)}>
                        {show ? <Cross1Icon /> : <DashboardIcon />}
                    </Button>
                    <Button variant={"ghost"} size={"icon"} onClick={addSalesItem}>
                        {typeScreen === 'Items' ? <Link to={"edit/" + item.id} >Edit</Link> : <ChevronRight />}
                    </Button>
                </div>
            </div>
            {show && <div>
                <div className="items-center gap-2">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Sale</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>{item.itemCategories?.categoryName}</TableCell>
                                <TableCell>
                                    {item.forStock ? <Check className="text-green-600" size={15} /> : <X className="text-red-600" size={15} />}
                                </TableCell>
                                <TableCell>
                                    {item.forSale ? <Check className="text-green-600" size={15} /> : <X className="text-red-600" size={15} />}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </div>
            }

            {show && loading && <div className="flex flex-col">
                <span className="mx-auto  text-center"><LoaderIcon className="animate-spin" /></span>
                <p className="text-center animate-bounce">Loading data ..</p>
            </div>}

            {show && !loading && <div className="mx-auto">
                <Table className="border">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Unit</TableHead>
                            <TableHead className="text-right">Factor</TableHead>
                            <TableHead className="text-right">Cost Price</TableHead>
                            <TableHead className="text-right">Sale Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {unitList?.map((unit) => <TableRow key={unit.id}>
                            <TableCell className="">{unit.unitName}</TableCell>
                            <TableCell className="text-right">{unit.factor}</TableCell>
                            <TableCell className="text-right">{unit.costPrice}</TableCell>
                            <TableCell className="text-right">{unit.salePrice}</TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table>
            </div>}
        </div>
    )
}
export default ItemComponent