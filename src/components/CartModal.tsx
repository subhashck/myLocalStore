import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Archive, ShoppingBag } from "lucide-react";
import { TInvoiceItems } from "@/utils/types";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

function CartModal({ cartDetails, deleteSalesItem, updateItem, updateItemUnit, setPaymentMode }:
  {
    cartDetails: TInvoiceItems[], deleteSalesItem: (index: number) => void,
    updateItem: (index: number, newQuantityType: 'Inc' | 'Dec') => void,
    updateItemUnit: (indexSales: number, indexUnit: number) => void,
    setPaymentMode: (paymentMode: boolean) => void
  }) {

  const updateUnit = (index: number, val: string) => {
    const unit = cartDetails[index].units
    const unitIndex = unit.findIndex(item => item.unitName === val)
    updateItemUnit(index, unitIndex)
  }
  const [open, setOpen] = useState(false);

  // console.log('cartDetails: ', cartDetails)
  return (
    <div className="">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="lg" className=" bg-fuchsia-300">
            <ShoppingBag />
            <span className=" italic p-2"> {cartDetails.length} items</span>
            {/* <div>Billed Amount: {getTotalBilledAmount()} ₹</div> */}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="px-2 max-h-[80%] min-h-[40%] overflow-scroll">
          <SheetHeader>
            <SheetTitle>Cart</SheetTitle>
            <SheetDescription>
              <Button variant="secondary" onClick={() => { setPaymentMode(true); setOpen(false) }} className="flex flex-row items-center bg-fuchsia-600 text-white">
                Pay
              </Button>
            </SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-2 mt-2 items-center gap-10">
            <h1 className="flex flex-col text-lg text-green-700 p-2 "></h1>
          </div>
          {cartDetails?.map((item, index) => {
            return (
              <div key={index} className="flex flex-col  mb-2 bg-slate-100 ">
                <div>
                  <div className="grid grid-cols-6 items-center">
                    <div className="col-span-3 flex flex-row gap-2 items-center text-sm">
                      <div className="col-span-1"> {index + 1} </div>
                      <div className="col-span-5">{item.itemName}</div>
                    </div>
                    <div className="col-span-2">
                      <Select onValueChange={(val) => updateUnit(index, val)}>
                        <SelectTrigger className="w-full text-xs h-6 italic">
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* @ts-ignore */}
                          {item.units?.map((item, index) => (
                            <SelectItem key={index} value={item.unitName}>
                              {item.unitName.toLowerCase()}
                            </SelectItem>
                          ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-1 text-right text-red-500">
                      <Button variant="ghost" onClick={() => deleteSalesItem(index)}>
                        <Archive size="15" />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-8 gap-2 items-center">
                  <div className="col-span-4 flex flex-row items-center gap-0 mr-2">
                    <Button variant="ghost" onClick={() => updateItem(index, 'Dec')}>-</Button>
                    <Input type="number" value={item.quantity.toString()} readOnly className="text-xs h-6 text-center" onChange={() => { }} />
                    <Button variant="ghost" onClick={() => updateItem(index, 'Inc')}>+</Button>
                    <span className="text-xs italic text-muted-foreground lowercase">{item.unit}</span>
                  </div>
                  <div className="col-span-2 ">
                    <Input type="number" value={item.price.toString()} className="text-xs h-6 text-right" onChange={() => { }} />
                  </div>
                  <div className="col-span-2 text-right text-xs text-mono">
                    {item.price * item.quantity} ₹
                  </div>
                  <div className="col-span-1 text-right "> </div>
                </div>
              </div>
            )
          })}
        </SheetContent>
      </Sheet>
    </div>
  )
}
export default CartModal