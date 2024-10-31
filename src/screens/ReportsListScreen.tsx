import DatePicker from "@/components/DatePicker"
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import supabase from "@/utils/supabase"
import { Cross1Icon, MagnifyingGlassIcon, PaperPlaneIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { LoaderIcon, PlusCircleIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

type TReport = {
  reportDate: Date,
  totalSales: number,
  totalExpenses: number,
  cashClosing: number
}

function ReportsListScreen() {

  const [loading, setLoading] = useState(true)
  const [reports, setReports] = useState<TReport[]>()
  const [filterDate, setFilterDate] = useState<Date | undefined>()

  const { toast } = useToast()

  const getDailyReport = async () => {
    setLoading(true)
    setReports(undefined)
    // await sleep(1000)

    let query = supabase
      .from('dailyReport')
      .select('reportDate, totalSales, totalExpenses, cashClosing')

    if (filterDate) {
      query = query.eq('reportDate', format(filterDate,'PP'))
    }

    const { data, error } = await query
      .order('reportDate', { ascending: false })
      .limit(45)

    // .eq('id', '')
    if (data) {
      setReports(data)
      setLoading(false)
    }
    else {
      setLoading(false)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + error.message
      })
      // throw Error("Unable to set Categories: " +  error)
    }
  }

  const clearFilter = () => {
    setFilterDate(undefined)

  }

  useEffect(() => { getDailyReport() }, [])

  return (
    <div className="flex flex-col  px-2 max-w-sm mx-auto">
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
              {/* <BreadcrumbLink asChild>
                <Link to="/sales">Sales</Link>
              </BreadcrumbLink>
              <BreadcrumbSeparator /> */}
              <BreadcrumbItem>
                <BreadcrumbPage>Daily Report List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* filter section */}
      <div className="flex justify-between items-center ">
        <div className="w-[50%]">
          <DatePicker filterDate={filterDate} setDate={(filterDate) => setFilterDate(filterDate)} />
        </div>


        <Button asChild variant={"outline"} className="gap-2">
          <Link to="/reports/new"><PlusCircleIcon /> New Report</Link>
        </Button>
      </div>
      <div className="flex justify-between my-2 border-b-2 py-2">
        <Button variant={"ghost"} onClick={clearFilter} className="text-red-700"> <Cross1Icon className="mr-2 text-red-700" />Clear Filter</Button>
        <Button variant={"outline"} onClick={getDailyReport}><MagnifyingGlassIcon className="mr-2" />Search</Button>
        {/* <Button variant={"default"}>New</Button> */}
      </div>

      {loading && <div className="flex justify-center mx-auto my-5"><LoaderIcon className="animate-spin" /></div>}

      {/* tabular data */}
      <section >
        <Table className="border-2">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Sales</TableHead>
              <TableHead className="text-right">Expenses</TableHead>
              <TableHead className="text-right">Closing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports?.map((report, index) => (
              <TableRow key={index}>
                <TableCell className="text-xs">{format(report.reportDate, 'PP')}</TableCell>
                <TableCell className="text-right">{report.totalSales}</TableCell>
                <TableCell className="text-right">{report.totalExpenses}</TableCell>
                <TableCell className="text-right">{report.cashClosing}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant={"ghost"} asChild> 
                    <Link to= {"/reports/view/"+ report.reportDate }><PaperPlaneIcon/> </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}
export default ReportsListScreen