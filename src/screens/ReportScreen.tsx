import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { currencyFormat } from "@/lib/utils"
import supabase from "@/utils/supabase"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { LoaderIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useParams } from "react-router-dom"
import { z } from "zod"



function ReportScreen({ mode = 'NEW' }: { mode?: string }) {

  const navigate = useNavigate();

  let { reportDate } = useParams();
  if(mode ==='NEW'){
    reportDate = format(new Date, "d-MMM-y")
  }
  
  const formSchema = z.object({
    prevClosing: z.coerce.number().gte(0),
    cashFunding: z.coerce.number().gte(0),
    upiFunding: z.coerce.number().gte(0),
    totalSales: z.coerce.number().gte(0),
    totalExpenses: z.coerce.number().gte(0),
    cashHandover: z.coerce.number().gte(0),
    previousDayDue: z.coerce.number().gte(0),
    reportDate: z.date(),
    todayDue: z.coerce.number().gte(0),
    cashClosing: z.number()
  })

  type TReportDetails = {
    totalPayable: number,
    paidUpi: number,
    paidCash: number,
    paidTotal: number
  }

  const availableCash = () => {
    if (sales && expenses && duePayment) {
      return sales.paidCash + duePayment.paidCash + Number(form.watch('cashFunding')) +Number(form.watch('prevClosing'))- expenses.paidCash
    } else return 0
  }

  const maxCashHandover = () => {
    form.clearErrors('cashHandover')
    // console.log(availableCash())
    if (availableCash() < Number(form.watch('cashHandover'))) {
      form.setError('cashHandover', { message: 'Check this handover cash' })
    }
  }

  const getClosing = () => {
    // console.log(availableCash(),Number(form.watch('cashHandover')) )
    const closing = availableCash() - Number(form.watch('cashHandover'))
    return closing
  }


  const form = useForm<TForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prevClosing: 0,
      cashFunding: 0,
      upiFunding: 0,
      totalSales: 0,
      totalExpenses: 0,
      cashHandover: 0,
      cashClosing: 0,
      previousDayDue: 0,
      reportDate: new Date,
      todayDue: 0
    }
  })


  const [loading, setLoading] = useState(false)
  const [sales, setSales] = useState<TReportDetails>()
  const [expenses, setExpenses] = useState<TReportDetails>()
  const [duePayment, setDuePayments] = useState<TReportDetails>()

  const { toast } = useToast()

  type TForm = z.infer<typeof formSchema>

  const { isSubmitting } = form.formState

  // submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // await sleep(1000)
    values.cashClosing = getClosing()

    maxCashHandover()
    const { error } = await supabase
      .from('dailyReport')
      .upsert(values, { onConflict: 'reportDate' })

    // console.log(values)

    if (error) {
      console.error('Error while saving Report: ' + error.message)
      toast({
        variant: "destructive",
        title: 'Error',
        description: 'Problem while saving Report ' + error.message
      })
      return
    }

    toast({
      description: 'Report saved successfully '
    })

    navigate('/reports')
  }

  const getSales = async () => {
    const { data, error } = await supabase
      .rpc('f_sales_daily_report', {
        f_date: reportDate
      })

    if (error) {
      setLoading(false)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + error?.message
      })
      return
    }
    if (data[0]) {
      setSales(data[0])
      form.setValue('totalSales', data[0].paidTotal)
      if (mode === 'NEW') {
        const due = data[0].totalPayable - data[0].paidTotal
        form.setValue('todayDue', due)
      }

    }
  }

  const getExpenses = async () => {
    const { data, error } = await supabase
      .rpc('f_purchases_daily_report', {
        f_date: reportDate
      })
    if (error) {
      setLoading(false)
      console.error('Error fetching from Database: ' + error?.message)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + error?.message
      })
      return
    }

    if (data[0]) {
      setExpenses(data[0])
      form.setValue('totalExpenses', data[0].paidTotal)
    }
  }

  const getDuePayments = async () => {
    const { data, error } = await supabase
      .rpc('f_sales_due_daily_report', {
        f_date: reportDate
      })
    if (error) {
      setLoading(false)
      console.error('Error fetching from Database: ' + error?.message)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + error?.message
      })
      return
    }

    if (data[0]) {
      setDuePayments(data[0])
    }
  }

  const getViewData = async () => {

    setLoading(true)
    const { data, error } = await supabase
      .from('dailyReport')
      .select('"prevClosing","previousDayDue","cashFunding","upiFunding","cashHandover","cashClosing","todayDue", "totalSales","totalExpenses" ')
      .eq('reportDate', reportDate)
      .single()

    if (error) {
      setLoading(false)
      console.error('Error fetching from Database: ' + error?.message)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + error?.message
      })
      return
    }

    if (data) {
      form.setValue('prevClosing', data.prevClosing)
      form.setValue('previousDayDue', data.previousDayDue)
      form.setValue('cashFunding', data.cashFunding)
      form.setValue('upiFunding', data.upiFunding)
      form.setValue('cashHandover', data.cashHandover)
      form.setValue('cashClosing', data.cashClosing)
      form.setValue('todayDue', data.todayDue)
    }

    getSales()
    getExpenses()
    getDuePayments()
    setLoading(false)

  }

  const getData = async () => {

    // const preDate = format(sub(new Date, { days: 2 }), "d-MMM-y")
   

    // console.log('date: ', reportDate)

    setLoading(true)

    const { data: prevDue, error: prevDueError } = await supabase
      .rpc('f_daily_report_prev_due', {
        f_date: reportDate
      })
    if (prevDueError) {
      setLoading(false)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + prevDueError?.message
      })
      return
    }
    else {
      form.setValue('previousDayDue', prevDue ? prevDue : 0)
    }

    const { data: todayDue, error: todayDueError } = await supabase
      .rpc('f_daily_report_today_due', {
        f_date: reportDate
      })
    if (prevDueError) {
      setLoading(false)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + todayDueError?.message
      })
      return
    }
    else {
      form.setValue('todayDue', todayDue ? todayDue : 0)
    }

    const { data: prevClosing, error: prevClosingError } = await supabase
      .rpc('f_daily_report_prevClosing', {
        f_date: reportDate
      })

    if (prevClosingError) {
      setLoading(false)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + prevClosingError?.message
      })
      return
    }
    else {
      form.setValue('prevClosing', prevClosing)
    }

    getSales()
    getExpenses()
    getDuePayments()

    // console.log(sales)

    // form.setValue('cashSales', data[0].paidCash)
    // form.setValue('upiSales', data[0].paidUpi)
    setLoading(false)

  }

  useEffect(() => {
    if (mode === 'VIEW') {
      getViewData()
    }
    else {
      getData()
    }
  }, [])

  return (
    <div className="flex flex-col  px-2 max-w-sm mx-auto">
      {/* {reportDate} */}
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
                <Link to="/reports">List of Daily Reports</Link>
              </BreadcrumbLink>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Daily Report</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>
      {loading && <div className="flex justify-center mx-auto "><LoaderIcon className="animate-spin" /></div>}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col  gap-2 px-2 ">
          <FormField
            control={form.control}
            name="prevClosing"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 items-center">
                  <FormLabel>Opening Cash</FormLabel>
                  <FormControl>
                    <Input placeholder="Previous Closing" {...field} className="text-right" disabled />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )} />
          <FormField
            control={form.control}
            name="previousDayDue"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 items-center">
                  <FormLabel>Previous Due</FormLabel>
                  <FormControl>
                    <Input placeholder="Previous Due" {...field} className="text-right border-b-red-600 border-b-2" disabled />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )} />
          <FormField
            control={form.control}
            name="cashFunding"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 items-center">
                  <FormLabel>Cash Fund</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder="Cash Fund" {...field} className="text-right" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )} />
          <FormField
            control={form.control}
            name="upiFunding"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 items-center">
                  <FormLabel>Upi Fund</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder="Upi Fund" {...field} className="text-right" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )} />


          <Table className="border-y-2">
            <TableCaption>Sales & expenses for the day.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Upi</TableHead>
                <TableHead className="text-right">Cash</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow >
                <TableCell> Sales</TableCell>
                <TableCell className="text-right">{currencyFormat(sales?.paidUpi)}</TableCell>
                <TableCell className="text-right">{currencyFormat(sales?.paidCash)}</TableCell>
                <TableCell className="text-right">{currencyFormat(sales?.paidTotal)}</TableCell>
              </TableRow>
              <TableRow >
                <TableCell> Payment from dues</TableCell>
                <TableCell className="text-right">{currencyFormat(duePayment?.paidUpi)}</TableCell>
                <TableCell className="text-right">{currencyFormat(duePayment?.paidCash)}</TableCell>
                <TableCell className="text-right">{currencyFormat(duePayment?.paidTotal)}</TableCell>
              </TableRow>
              <TableRow >
                <TableCell> Expenses</TableCell>
                <TableCell className="text-right">{currencyFormat(expenses?.paidUpi)}</TableCell>
                <TableCell className="text-right">{currencyFormat(expenses?.paidCash)}</TableCell>
                <TableCell className="text-right">{currencyFormat(expenses?.paidTotal)}</TableCell>
              </TableRow>
              {/* <TBD>Payment for due expenses</TBD> */}
              <TableRow >
                <TableCell> Net</TableCell>
                {sales && expenses && duePayment && <>
                  <TableCell className="text-right">{currencyFormat((sales.paidUpi + duePayment.paidUpi) - (expenses.paidUpi))}</TableCell>
                  <TableCell className="text-right">{currencyFormat((sales.paidCash + duePayment.paidCash) - (expenses.paidCash))}</TableCell>
                  <TableCell className="text-right">{currencyFormat((sales.paidTotal +duePayment.paidTotal+ Number(form.watch('upiFunding')) + Number(form.watch('cashFunding'))) - (expenses.paidTotal))} </TableCell>
                </>
                }

              </TableRow>

            </TableBody>
          </Table>

          <FormField
            control={form.control}
            name="todayDue"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 items-center ">
                  <FormLabel>Due from today</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder="Due for today" {...field} className="text-right border-b-red-600 border-b-2" disabled />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )} />

          <FormField
            control={form.control}
            name="cashHandover"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 items-center">
                  <FormLabel>Cash Handover</FormLabel>
                  <FormControl>
                    <Input type='number' placeholder="Cash Handover" {...field} className="text-right" />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )} />
          {/* <div>{getClosing()}</div> */}
          <FormField
            control={form.control}
            name="cashClosing"
            render={({ field }) => (
              <FormItem>
                <div className="grid grid-cols-2 items-center">
                  <FormLabel>Cash Closing</FormLabel>
                  <FormControl>
                    <Input  {...field} type="number" className="text-right" disabled value={getClosing()} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )} />

          {/* {JSON.stringify(form.formState.errors)} */}

          <div className="flex flex-grow h-[6vh]"/>

          <Button type="submit" className="bg-green-700" disabled={loading || isSubmitting||mode==='VIEW'}>{isSubmitting ? <LoaderIcon className="animate-spin" /> : 'Save'}</Button>
          <Button variant="ghost" onClick={()=>navigate('/reports')}>Back</Button>
        </form>
      </Form>

    </div>
  )
}
export default ReportScreen