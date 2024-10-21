import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import supabase from "@/utils/supabase"
import { TInvoiceItems } from "@/utils/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { CaretLeftIcon } from "@radix-ui/react-icons"
import { LoaderIcon } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { z } from "zod"

// const unitSchema = z.array(z.object({
//   unitName: z.string(),
//   factor: z.number().gte(0),
//   costPrice: z.number().gte(0),
//   salePrice: z.number().gte(0)
// }))

const cartSchema = z.array(z.object({
  itemId: z.number(),
  itemName: z.string(),
  unit: z.string(),
  quantity: z.number().gt(0),
  price: z.number().gte(0),
  // units: unitSchema
}))

function SalesPaymentComponent(
  { cartDetails, totalAmount, setPaymentMode }: 
  { cartDetails?: TInvoiceItems[], totalAmount: number, setPaymentMode: (paymentMode: boolean) => void }) {

  // const [discount, setDiscount] = useState(0)

  const { toast } = useToast()
  const navigate = useNavigate();

  const formSchema = z.object({
    isPOS: z.boolean(),
    isDue: z.boolean(),
    customerName: z.string().min(5, { message: 'Name should be atleast 5 characters' }),
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
      isPOS: false,
      isDue: false,
      customerName: 'Retail',
      cart: cartDetails,
      billedAmount: 0,
      discount: 0,
      paidUpi: 0,
      paidCash: 0
    }
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (values: z.infer<typeof formSchema>) => {

    // console.log('on-submit', values)

    const { customerName, billedAmount, discount,
      paidUpi, paidCash, cart } = values

    const invoiceDate = new Date()

    const totalPaid = paidUpi + paidCash
    const payableAmount = billedAmount - discount
    const status = (payableAmount > totalPaid ? 'DUE' : 'PAID')

    const record = {
      customer: customerName.toUpperCase(), billedAmount, discount,
      paidUpi, paidCash, totalPaid, payableAmount, status, invoiceDate
    }

    const { data, error } = await supabase
      .from('sales')
      .insert(record)
      .select('id')
      .single()

    // console.log('data: ', data)
    if (error) {
      console.error('Error while saving new Sales Invoice: ' + error.message)
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'Problem while saving new Sales Invoice: ' + error.message
      })
      return
    } else if (data) {
      let toInsert = [{}]
      toInsert.splice(0, 1)
      cart?.forEach(element => {
        toInsert.push({
          salesId: data.id,
          itemId: element.itemId,
          itemName: element.itemName,
          price: element.price,
          quantity: element.quantity,
          unit: element.unit,
          amount: element.price * element.quantity
        })
      })
      const insertUnits = await supabase
        .from('saleDetails')
        .insert(toInsert)

      if (insertUnits.error) {
        console.error('Error while saving creating sale details  ', insertUnits.error)
        toast({
          variant: "destructive",
          title: 'Error',
          description: 'Problem while saving new Sales Invoice: ' + insertUnits.error.message
        })
        const deleteItem = await supabase
          .from('sales')
          .delete()
          .eq('id', data.id)
        if (deleteItem.error) {
          console.error('Error while rolling back sales ', deleteItem.error)
          toast({
            variant: "destructive",
            title: 'Error',
            description: 'Problem while saving new Sales Invoice: ' + deleteItem?.error.message
          })
          return
        }
        return
      }

      navigate('/sales')

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


  useEffect(() => {
    const isPOS = form.watch('isPOS')
    if (isPOS) {
      form.setValue('customerName', '')
      form.setFocus('customerName')
      // form.setValue('isDue', false)
    }
    else {
      form.setValue('customerName', 'Retail')
      form.clearErrors('customerName')
      form.setValue('isDue', false)
    }
  }, [form.watch('isPOS')])

  return (
    <div className="flex flex-col border px-2 -mx-3">

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} >
          {/* <div className="flex flex-col  px-2 max-w-sm mx-auto"> */}
          <section className="mb-5">
            <div className="text-center text-xl">Tamogee Dukan</div>
            <div className="text-center text-xs">Khagempalli Panthak, Imphal-795001, Manipur</div>
          </section>

          <FormField
            control={form.control}
            name="isPOS"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg  p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Customer</FormLabel>
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
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="text" placeholder="Customer Name" {...field} disabled={!form.watch('isPOS')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

            <FormField
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
                      disabled={!form.watch('isPOS')}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {/* <Button className="w-full" type="submit">Save</Button> */}
            <Button type="submit" disabled={isSubmitting || cartDetails === undefined} className="bg-green-700">{isSubmitting?<LoaderIcon className="animate-spin"/>:'Save'}</Button>
            {/* {form.watch('isPOS') && <Button className="w-full" type="submit" disabled={isSubmitting || cartDetails === undefined}>Mark Due</Button>} */}
            <Button className="w-full" variant={"link"} onClick={() => setPaymentMode(false)}><CaretLeftIcon /> Back to Sales</Button>
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
export default SalesPaymentComponent