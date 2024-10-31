import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
// import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import supabase from "@/utils/supabase"
import { TInvoiceItems, TVendor } from "@/utils/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { CaretLeftIcon, CaretSortIcon, CheckIcon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import VendorComponent from "./VendorComponent"
import { useNavigate } from "react-router-dom"
import { LoaderIcon } from "lucide-react"

const cartSchema = z.array(z.object({
  itemId: z.number(),
  itemName: z.string(),
  unit: z.string(),
  quantity: z.number().gt(0),
  price: z.number().gte(0),
  // units: unitSchema
}))

function PurchasePaymentComponent({ cartDetails, totalAmount, setPaymentMode }: { cartDetails?: TInvoiceItems[], totalAmount: number, setPaymentMode: (paymentMode: boolean) => void }) {

  const [isNewVendor, setIsNewVendor] = useState(false)
  // const [showNewVendor, setShowNewVendor] = useState(false)
  const [vendorList, setVendorList] = useState<TVendor[]>()

  const { toast } = useToast()
  const navigate = useNavigate();


  const formSchema = z.object({
    // isPOS: z.boolean(),
    isDue: z.boolean(),
    vendorName: z.string().min(1, { message: 'Name should be atleast 5 characters' }),
    vendorAddress: z.string().optional(),
    vendorPhone: z.coerce.number().optional(),
    cart: cartSchema.optional(),
    billedAmount: z.coerce.number().gte(0),
    discount: z.coerce.number().gte(0),
    paidUpi: z.coerce.number().gte(0).lte(totalAmount),
    paidCash: z.coerce.number().gte(0).lte(totalAmount),
  })
    .superRefine((val, ctx) => {
      // console.log('issue with validation', val)
      if (val.discount > val.billedAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Discount cannot be more than Total",
          // type: 'custom',
          path: ['discount']
        })
      }
      if (!val.isDue) {
        if ((val.billedAmount - val.discount) !== (val.paidCash + val.paidUpi)) {
          if (val.paidCash > 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Paid amount is incorrect",
              // type: 'custom',
              path: ['paidCash']
            })
          }
          if (val.paidUpi > 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Paid amount is incorrect",
              path: ['paidUpi']
            })
          }
          if (val.paidCash === 0 && val.paidUpi === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Paid amount is incorrect",
              // type: 'custom',
              path: ['paidCash']
            })
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Paid amount is incorrect",
              path: ['paidUpi']
            })
          }
        }
      }
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'all',
    defaultValues: {
      // isPOS: false,
      isDue: false,
      vendorName: 'RETAIL',
      vendorAddress: '',
      vendorPhone: 0,
      cart: cartDetails,
      billedAmount: 0,
      discount: 0,
      paidUpi: 0,
      paidCash: 0
    }
  })

  const getVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select(`id, vendorName, vendorAddress, vendorPhone`)
    if (error) {
      console.error('Error while fetching list of vendors: ' + error.message)
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'Problem fetching list of vendors: ' + error.message
      })
      return
    }

    setVendorList(data)

  }

  const onSaveNewVendor = (vendor: TVendor) => {
    if (!vendorList) return
    const x = [...vendorList]
    vendor.vendorName = vendor.vendorName.toUpperCase()
    x.push(vendor)
    setVendorList(x)
    // setShowNewVendor(false)
    setIsNewVendor(true)
    form.setValue('vendorName', vendor.vendorName.toUpperCase())
    form.setValue('vendorAddress', vendor.vendorAddress)
    form.setValue('vendorPhone', vendor.vendorPhone)
    form.clearErrors()
  }

  const { isSubmitting } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    // console.log('on-submit', values)

    const { vendorName, vendorPhone, vendorAddress, billedAmount, discount,
      paidUpi, paidCash, cart } = values

    const invoiceDate = new Date()

    const totalPaid = paidUpi + paidCash
    const payableAmount = billedAmount - discount
    const status = (payableAmount > totalPaid ? 'DUE' : 'PAID')

    const record = {
      vendorName, vendorPhone, vendorAddress, billedAmount, discount,
      paidUpi, paidCash, totalPaid, payableAmount, status, invoiceDate
    }

    if (isNewVendor) {
      const { error } = await supabase
        .from('vendors')
        .insert({ vendorName, vendorPhone, vendorAddress })
        .select('id')
        .single()

      if (error) {
        console.error('Error while saving new Purchase Invoice: ' + error.message)
        toast({
          variant: "destructive",
          title: 'Error',
          description: 'Problem while saving new Purchase Invoice: ' + error.message
        })
        return
      }
    }


    const { data, error } = await supabase
      .from('purchases')
      .insert(record)
      .select('id')
      .single()

    // console.log('data: ', data)
    if (error) {
      console.error('Error while saving new Purchase Invoice: ' + error.message)
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'Problem while saving new Purchase Invoice: ' + error.message
      })
      return
    } else if (data) {
      let toInsert = [{}]
      toInsert.splice(0, 1)
      cart?.forEach(element => {
        toInsert.push({
          purchaseId: data.id,
          itemId: element.itemId,
          itemName: element.itemName,
          price: element.price,
          quantity: element.quantity,
          unit: element.unit,
          amount: element.price * element.quantity
        })
      })
      const insertUnits = await supabase
        .from('purchaseDetails')
        .insert(toInsert)

      if (insertUnits.error) {
        console.error('Error while saving creating Purchase details  ', insertUnits.error)
        toast({
          variant: "destructive",
          title: 'Error',
          description: 'Problem while saving new Purchase Invoice: ' + insertUnits.error.message
        })
        const deleteItem = await supabase
          .from('sales')
          .delete()
          .eq('id', data.id)
        if (deleteItem.error) {
          console.error('Error while rolling back Purchase ', deleteItem.error)
          toast({
            variant: "destructive",
            title: 'Error',
            description: 'Problem while saving new Purchase Invoice: ' + deleteItem?.error.message
          })
          return
        }
        return
      }

      navigate('/expenses')

      toast({
        description: "Bill saved successfully..",
      })
    }
  }

  const getPayable = () => {
    const discount = form.watch('discount')
    // console.log('fn-getPayable-')
    return totalAmount - discount
  }

  const setPay = (paymentMode: string) => {
    if (paymentMode === 'paidCash') {
      form.setValue('paidCash', getPayable())
      form.setValue('paidUpi', 0)
    } else {
      form.setValue('paidUpi', getPayable())
      form.setValue('paidCash', 0)
    }

  }

  useEffect(() => {
    form.setValue("billedAmount", totalAmount)
  }, [totalAmount])

  useEffect(() => {
    if (form.watch('isDue')) {
      form.clearErrors('paidCash')
      form.clearErrors('paidUpi')
    }
  }, [form.watch('isDue')])

  useEffect(() => {getVendors()}, [])

  return (
    <div className="flex flex-col border px-2 -mx-3">
      {/* <div>{JSON.stringify(vendorList)}</div> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} >
          {/* <div className="flex flex-col  px-2 max-w-sm mx-auto"> */}
          <h1 className="text-center underline text-lg">Vendor Details</h1>
          <section className="grid grid-flow-row gap-2 py-2 border-b-2">
            <FormField
              control={form.control}
              name="vendorName"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center">
                    <FormLabel className="col-span-1 text-left">Vendor Name</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            type="button"
                            role="combobox"
                            className={cn(
                              "w-full col-span-3 justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? vendorList?.find(
                                (vendor) => vendor.vendorName === field.value
                              )?.vendorName
                              : "Select Vendor"}
                            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="min-w-min p-1 ">
                        <Command>
                          <CommandInput
                            placeholder="Search Vendor..."
                            className="h-9"
                          />
                          <CommandList>
                            {/* <CommandEmpty>No Vendor Found.</CommandEmpty> */}
                            <CommandEmpty>
                              {!isNewVendor && <Button type="button" onClick={() => setIsNewVendor(true)}>Create new vendor</Button>}
                              {isNewVendor &&
                                <VendorComponent onSave={(vendor: TVendor) => onSaveNewVendor(vendor)} />
                              }
                            </CommandEmpty>
                            <CommandGroup>
                              {vendorList?.map((vendor) => (
                                <CommandItem
                                  value={vendor.vendorName}
                                  key={vendor.vendorName}
                                  onSelect={() => {
                                    form.setValue("vendorName", vendor.vendorName)
                                    form.setValue("vendorAddress", vendor.vendorAddress===null?'Unknown':vendor.vendorAddress)
                                    form.setValue("vendorPhone", vendor.vendorPhone)
                                  }}
                                >
                                  {vendor.vendorName}
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      vendor.vendorName === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendorAddress"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center">
                    <FormLabel>Address</FormLabel>
                    <FormControl className="col-span-3">
                      <Input type="text" placeholder="Vendor Address" {...field} disabled />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vendorPhone"
              render={({ field }) => (
                <FormItem>
                  <div className="grid grid-cols-4 items-center">
                    <FormLabel>Phone</FormLabel>
                    <FormControl className="col-span-3">
                      <Input type="number" placeholder="Vendor Phone" {...field} disabled />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <section className="grid grid-cols-6 text-sm border-b-2 mt-5" >
            <div className="col-span-2">Item</div>
            <div className="col-span-2">Qty</div>
            <div className="text-right">Rate</div>
            <div className="text-right">Amount</div>
          </section>

          {cartDetails && cartDetails.map((item, index) => {
            return (
              <section className="grid grid-rows-2" key={index}>
                <div className="text-sm">{index + 1} {item.itemName}</div>
                <div className="grid grid-cols-6 text-sm">
                  <div className="col-span-2"></div>
                  <div className="col-span-2 font-mono ">{item.quantity} <span className="lowercase italic"> {item.unit}</span></div>
                  <div className="font-mono text-right">{item.price}</div>
                  <div className="font-mono text-right">{item.price * item.quantity}</div>
                </div>
              </section>
            )
          })}

          <div className="flex flex-col gap-2 mt-5 border-t-2 pt-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>Total Billed</div>
              <FormField
                control={form.control}
                name="billedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="number" readOnly  {...field} className="text-right font-mono pr-0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <div>Discount</div>
              <FormField
                control={form.control}
                name="discount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="number" placeholder="Discount" {...field} className="text-right font-mono pr-0" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <Input type="number" className="text-right font-mono pr-0" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} /> */}
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <div>Payable</div>
              <div className="font-mono text-right">{getPayable()}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <div>Paid by Cash</div>
              <div className="flex flex-row">
                <Button type="button" size="icon" variant={"destructive"} onClick={() => setPay('paidCash')}>Pay</Button>
                <FormField
                  control={form.control}
                  name="paidCash"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" {...field} className="text-right font-mono pr-0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <Input type="number" className="text-right font-mono pr-0" defaultValue={"220.00"} /> */}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 items-center">
              <div>Paid by UPI</div>
              <div className="flex flex-row">
                <Button type="button" size="icon" variant={"destructive"} onClick={() => setPay('paidUpi')}>Pay</Button>
                <FormField
                  control={form.control}
                  name="paidUpi"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" {...field} className="text-right font-mono pr-0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <section className="flex flex-col mt-5 border-t-2 pt-2 gap-2">

            {/* <FormField
              control={form.control}
              name="isDue"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg  p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Is Due?</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      disabled={form.watch('vendorName') === 'Retail'}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}
            {/* <Button className="w-full" type="submit">Save</Button> */}
            <Button type="submit" disabled={isSubmitting || cartDetails === undefined} className="bg-green-700">{isSubmitting?<LoaderIcon className="animate-spin"/>:'Save'}</Button>
            {/* {form.watch('isPOS') && <Button className="w-full" type="submit" disabled={isSubmitting || cartDetails === undefined}>Mark Due</Button>} */}
            <Button className="w-full" variant={"link"} onClick={() => setPaymentMode(false)}><CaretLeftIcon /> Back to Purchase</Button>
          </section>
        </form>
      </Form>
      <Collapsible className="text-gray-400 text-sm text-center">
        <CollapsibleTrigger>Check Error?</CollapsibleTrigger>
        <CollapsibleContent>
          {form.formState.errors && <p>{JSON.stringify(form.formState.errors)}</p>}
        </CollapsibleContent>
      </Collapsible>
    </div >
  )
}
export default PurchasePaymentComponent