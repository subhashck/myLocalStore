import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog"
import supabase from "@/utils/supabase"
import { useToast } from "@/hooks/use-toast"
import { currencyFormat } from "@/lib/utils"
import { LoaderIcon } from "lucide-react"

function PaymentComponent(
    { id, totalAmount, previousPaidUpi, previousPaidCash }:
        { id: number, totalAmount: number, previousPaidUpi: number, previousPaidCash: number }) {

    const { toast } = useToast()

    const balancePayable = (totalAmount - (previousPaidUpi + previousPaidCash))

    const paymentSchema = z.object({
        paidUpi: z.coerce.number().gte(0).lte(totalAmount),
        paidCash: z.coerce.number().gte(0).lte(totalAmount)
    })
        .superRefine((val, ctx) => {
            const totalPaid = val.paidUpi + val.paidCash
            if (totalPaid !== balancePayable) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Total Payment expected is " + balancePayable,
                    // type: 'custom',
                    path: ['paidCash']
                })

                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Total Payment expected is " + balancePayable,
                    // type: 'custom',
                    path: ['paidUpi']
                })
            }
        })

    const form = useForm<z.infer<typeof paymentSchema>>({
        resolver: zodResolver(paymentSchema),
        mode: 'all',
        defaultValues: {
            paidUpi: 0,
            paidCash: 0
        }
    })

    const { isSubmitting } = form.formState

    const onSubmit = async (values: z.infer<typeof paymentSchema>) => {

        const record = {
            paidCash: values.paidCash,
            paidUpi: values.paidUpi,
            totalPaid: values.paidCash + values.paidUpi,
            status: 'PAID',
            paymentDate: new Date
        }

        const { error } = await supabase
            .from('sales')
            .update(record)
            .eq('id', id)
            .single()

        if (error) {
            console.error('Error while saving Payment: ' + error.message)
            toast({
                variant: "destructive",
                title: 'Error',
                description: 'Problem while saving Payment: ' + error.message
            })
            return
        } else {
            toast({
                variant: "default",
                description: 'Sales Payment saved '
            })
        }
    }

    return (
        <div className="flex flex-col gap-2">
            <DialogHeader>
                <DialogTitle> Make new Payment for {currencyFormat((totalAmount - (previousPaidUpi + previousPaidCash)))}</DialogTitle>
                <DialogDescription>
                    Select one or both payment options
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} >
                    <div className="grid grid-flow-row gap-2">
                        <div className="grid grid-flow-col items-center gap-5">
                            <FormField
                                control={form.control}
                                name="paidCash"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="grid grid-cols-7 items-center gap-1">
                                            <FormLabel className="col-span-1">Cash</FormLabel>
                                            <FormControl className="col-span-4">
                                                <Input type="number" {...field} className="text-right font-mono " />
                                            </FormControl>
                                            <Button className="col-span-2" type="button" variant={"destructive"} onClick={() => { form.setValue('paidCash', (totalAmount - (previousPaidUpi + previousPaidCash))); form.setValue('paidUpi', 0) }}>Pay</Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                        </div>
                        <div className="grid grid-flow-col items-center gap-5">
                            <FormField
                                control={form.control}
                                name="paidUpi"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="grid grid-cols-7 items-center gap-1">
                                            <FormLabel className="col-span-1">UPI</FormLabel>
                                            <FormControl className="col-span-4">
                                                <Input type="number" {...field} className="text-right font-mono " />
                                            </FormControl>
                                            <Button type="button" variant={"destructive"} className="col-span-2" onClick={() => { form.setValue('paidUpi', (totalAmount - (previousPaidUpi + previousPaidCash))); form.setValue('paidCash', 0) }}>Pay</Button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                        </div>
                    </div>
                    {/* <p>{form.watch('paidUpi')}</p>
                    <p>{form.watch('paidCash')}</p>
                    <p>{JSON.stringify(form.formState.errors)}</p> */}
                    {/* <DialogFooter className="sm:justify-start">
                        <DialogClose asChild>
                            <Button type="submit" variant="secondary">
                                Save
                            </Button>
                        </DialogClose>
                    </DialogFooter> */}
                    <Button type="submit" className="bg-green-700 w-full mt-5" disabled={isSubmitting}>{isSubmitting ? <LoaderIcon className="animate-spin" /> : 'Save'}</Button>
                </form>
            </Form>
        </div>
    )
}
export default PaymentComponent