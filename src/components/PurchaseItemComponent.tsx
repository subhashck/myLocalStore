import { TVendorListItem } from "@/utils/types"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { CaretDownIcon, Cross1Icon } from "@radix-ui/react-icons"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import supabase from "@/utils/supabase"
import { useToast } from "@/hooks/use-toast"
import { LoaderIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"
import clsx from "clsx"
import { currencyFormat } from "@/lib/utils"
import { format } from "date-fns"

type TSaleItems = {
    id: number,
    itemName: string,
    unit: string,
    quantity: number,
    price: number,
    amount: number
}

function PurchaseItemComponent({ index, item }: { index: number, item: TVendorListItem }) {

    const { toast } = useToast()
    const [show, setShow] = useState(false)
    const [sales, setSales] = useState<TSaleItems[]>()
    const [loading, setLoading] = useState(true)
    //fetch functions
    const getSaleDetails = async () => {
        // await sleep(10000)
        const { data, error } = await supabase
            .from('purchaseDetails')
            .select('id, itemName, unit, price, quantity, amount')
            .eq('purchaseId', item.id)
        if (!error) {
            setSales(data)
            setLoading(false)
            // setItemsList(data)
            // console.log(data)
        } else {
            setLoading(false)
            toast({
                variant: 'destructive',
                description: 'Error fetching from Database: ' + error.message
            })
        }
    }
    useEffect(() => {
        if (show) getSaleDetails()
    }, [show])

    return (
        <div className="grid grid-row-2 gap-1  p-2 rounded-md shadow-lg border">
            <div className="flex justify-between gap-1 flex-1 items-center">
                <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-1">{index + 1}</div>
                    <div className="col-span-3 text-sm italic">{item.vendorName}</div>
                    <div className="col-span-3 text-xs  text-center">{format(item.invoiceDate,'PP')}</div>
                    <div className="col-span-2 text-xs text-right font-mono">{item.billedAmount}</div>
                    <div className={clsx("col-span-2 text-xs muted text-center rounded-lg px-1 py-1", (item.status === 'DUE') && 'bg-pink-700 text-white', (item.status === 'PAID') && 'bg-lime-700 text-white')}>{item.status}</div>
                    <div className="col=span-1 text-right text-xs">
                        <Button variant="ghost" size={"icon"} onClick={() => setShow(!show)}>
                            {show ? <Cross1Icon /> : <CaretDownIcon />}
                        </Button>
                    </div>
                </div>
            </div>
            {show && <div className="flex flex-col" >

                {loading && <div className="mx-auto">
                    <LoaderIcon className="animate-spin" />
                    {/* <div>Fetching sale details </div> */}
                </div>}

                {!loading && <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead >Item</TableHead >
                            <TableHead className="text-right">Quantity</TableHead >
                            <TableHead className="text-right">Rate</TableHead >
                            <TableHead className="text-right">Amount</TableHead >
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales?.map((sale) => <TableRow key={sale.id}>
                            <TableCell className="text-left">{sale.itemName}</TableCell>
                            <TableCell className="text-right lowercase">{sale.quantity} {sale.unit}</TableCell>
                            <TableCell className="text-right">{sale.price}</TableCell>
                            <TableCell className="text-right">{sale.amount}</TableCell>
                        </TableRow>)
                        }
                        <TableRow>
                            <TableCell colSpan={3}>Total Billed</TableCell>
                            <TableCell className="text-right font-mono">{currencyFormat(item.billedAmount)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={3}>Discount</TableCell>
                            <TableCell className="text-right font-mono">{currencyFormat(item.discount)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={3}>Payable</TableCell>
                            <TableCell className="text-right font-mono">{currencyFormat(item.payableAmount)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell >Total Paid</TableCell>
                            <TableCell colSpan={2} >
                                <Accordion type="single" collapsible>
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>Payment Details</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="grid grid-cols-2">
                                                <div>UPI</div>
                                                <div className="text-right font-mono">{item.paidUpi}</div>
                                            </div>
                                            <div className="grid grid-cols-2">
                                                <div>Cash</div>
                                                <div className="text-right font-mono">{item.paidCash}</div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </TableCell>
                            <TableCell className="text-right font-mono" >{currencyFormat(item.totalPaid)}</TableCell>
                        </TableRow>
                        <TableRow>

                        </TableRow>
                    </TableBody>
                </Table>}
                {/* {item.status === 'DUE' &&
                    <Dialog>
                        <DialogTrigger asChild className="bg-indigo-700 p-2 text-white "><Button>Make Payment</Button></DialogTrigger>
                        <DialogContent >
                            <PaymentComponent id={item.id} totalAmount = {item.payableAmount}  previousPaidUpi={item.paidUpi} previousPaidCash={item.paidCash} />
                        </DialogContent >
                    </Dialog>} */}
            </div>
            }

        </div>
    )
}
export default PurchaseItemComponent