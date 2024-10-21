import { useToast } from "@/hooks/use-toast"
import supabase from "@/utils/supabase"
import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { format } from "date-fns"
import clsx from "clsx"
import { LoaderIcon } from "lucide-react"
import { sleep } from "@/lib/utils"


type TInventoryItemDetail = {
  counterParty: string,
  quantity: number,
  unitName: string,
  invoiceDate: Date,
  status: string
}

function InventoryTxnDetails({ itemId }: { itemId: number }) {

  const { toast } = useToast()

  const [loading, setLoading] = useState(true)

  const [itemDetails, setItemDetails] = useState<TInventoryItemDetail[]>()

  //fetch stock transactions for an item
  const getStockTxn = async (itemId: number) => {
    await sleep(1000)
    setLoading(true)
    const { data, error } = await supabase
      .from('v_inventoryDetails')
      .select('counterParty,quantity, unitName, invoiceDate, status')
      .eq('itemId', itemId)
      .order('invoiceDate')

    if (!error) {
      setLoading(false)
      setItemDetails(data)
    } else {
      setLoading(false)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + error.message
      })
    }
  }

  useEffect(() => { getStockTxn(itemId) }, [])

  if(loading){
    return (<div className="flex flex-col items-center">
      <LoaderIcon className="animate-spin my-5" />
      <p className="animate-bounce">Loading data ...</p>
    </div>)
  }

  return (
    <div className="flex flex-col items-center max-h-[70vh] overflow-scroll">
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sl</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {itemDetails?.map((item, index) => (
            <TableRow key={index}
              className={
                clsx(item.quantity < 0 && "bg-red-400 hover:bg-red-600",
                  item.quantity >= 0 && "bg-sky-400 hover:bg-sky-600",
                )}>
              <TableCell className="text-right">{index + 1}</TableCell>
              <TableCell className="text-left font-medium">{item.counterParty}</TableCell>
              <TableCell className="text-left">{format(item.invoiceDate, 'PP')}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-xs muted italic lowercase"> {item.unitName}</TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </div>
  )
}
export default InventoryTxnDetails