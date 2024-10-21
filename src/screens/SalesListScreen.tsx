import DatePicker from "@/components/DatePicker";
import SalesItemComponent from "@/components/SalesItemComponent";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
// import { sleep } from "@/lib/utils";
import supabase from "@/utils/supabase";
import { TSaleListItem } from "@/utils/types";
import { Cross1Icon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { QueryData } from "@supabase/supabase-js";
import { LoaderIcon, PlusCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PostgrestFilterBuilder } from '@supabase/postgrest-js/'


function SalesListScreen() {
    const [loading, setLoading] = useState(true)
    const { toast } = useToast()
    const [sales, setSales] = useState<TSaleListItem[]>()
    const [filterOnlyDue, setfilterOnlyDue] = useState(false)
    const [filterCustomer, setFilterCustomer] = useState('')
    const [filterItem, setFilterItem] = useState('')
    const [filterDate, setFilterDate] = useState<Date | undefined>()

    //fetch functions
    const getSales = async () => {

        setLoading(true)
        setSales(undefined)
        // await sleep(400)

        type TResult = PostgrestFilterBuilder<any, any, any, "sales", unknown>

        let query: QueryData<TResult>

        if (filterItem) {
            query = supabase
                .rpc('f_sales_filter_by_item', { f_itemname: filterItem })
        }
        else {
            query = supabase.from('sales')
                .select('id, customer, status, invoiceDate, billedAmount, discount, payableAmount,paidUpi, paidCash, totalPaid')

        }

        if (filterOnlyDue) {
            query = query.eq('status', 'DUE')
        }

        if (filterCustomer) {
            query = query.ilike('customer', '%' + filterCustomer + '%')
        }

        if (filterDate) {
            query = query.eq('invoiceDate', filterDate.toDateString())
        }

        const { data, error } = await query.order('created_at',{ascending: false})
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

    const clearFilter = () => {
        setFilterCustomer('')
        setfilterOnlyDue(false)
        setFilterDate(undefined)
        setFilterItem('')
    }

    useEffect(() => {
        getSales()
    }, [])

    return (
        <div className="max-w-sm mx-auto px-1 pb-5">
            {/* {filterDate?.toString()} */}
            <section className="mb-5">
                <div className="text-center text-xs ">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link to="/">Home</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Sales</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="text-center text-xl">List of Sales</div>
            </section>

            {/* filter div */}
            <div className="flex justify-between items-center">
                <div className="w-[50%]">
                    <DatePicker filterDate={filterDate} setDate={(filterDate) => setFilterDate(filterDate)} />
                </div>
                <div className="flex gap-2 items-center">
                    <Label htmlFor="filterOnlyDue">Due only</Label>
                    <Switch id="filterOnlyDue" checked={filterOnlyDue} onCheckedChange={(val) => setfilterOnlyDue(val)} />
                </div>

                <Button asChild size="icon" variant={"ghost"}>
                    <Link to="/sales/new"><PlusCircleIcon /> </Link>
                </Button>

            </div>
            <div className="flex justify-between mt-2 gap-2">
                <Input className="" placeholder="Filter by Customer Name" value={filterCustomer}
                    onChange={(e) => setFilterCustomer(e.target.value)} />
                <Input className="" placeholder="Filter by Item Name" value={filterItem}
                    onChange={(e) => setFilterItem(e.target.value)} />
            </div>
            <div className="flex justify-between my-2">
                <Button variant={"ghost"} onClick={clearFilter} className="text-red-700"> <Cross1Icon className="mr-2 text-red-700" />Clear Filter</Button>
                <Button variant={"outline"} onClick={getSales}><MagnifyingGlassIcon className="mr-2" />Search</Button>
                {/* <Button variant={"default"}>New</Button> */}
            </div>
            <hr />

            {loading && <div className="flex justify-center mx-auto "><LoaderIcon className="animate-spin" /></div>}

            {!loading && <div><div className="grid grid-cols-11 gap-2 items-center p-2 text-sm muted">
                <div className="col-span-1"></div>
                <div className="col-span-3">Customer</div>
                <div className="col-span-3  text-left">Date</div>
                <div className="col-span-2 text-left">Amt</div>
                <div className="col-span-1"></div>
                <div className="col-span-1"></div>
            </div>
                <div className="">
                    {sales?.map((item: TSaleListItem, index) =>
                        <div key={item.id} className="flex flex-col mb-2">
                            {/* {JSON.stringify(item)} */}
                            <SalesItemComponent index={index} item={item} />
                        </div>
                    )}
                </div>
            </div>}

        </div>
    )
}
export default SalesListScreen