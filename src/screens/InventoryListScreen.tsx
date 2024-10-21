import InventoryTxnDetails from "@/components/InventoryTxnDetails";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/utils/supabase";
import { TCategoryList } from "@/utils/types";
import { Cross1Icon, DashboardIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import clsx from "clsx";
import { LoaderIcon, PlusCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type TInventoryItem = {
  itemId: number,
  itemName: string,
  quantity: number,
}



function InventoryListScreen() {

  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<TInventoryItem[]>()
  const [itemList, setItemsList] = useState<TInventoryItem[]>()


  const [categories, setCategories] = useState<TCategoryList[]>()
  const [filterCategory, setFilterCategory] = useState('')
  const [filterValue, setFilterValue] = useState("");

  const getCategories = async () => {
    // await sleep(10000)
    
    const { data, error } = await supabase
      .from('itemCategories')
      .select('id, categoryName')
    if (data) {
      setCategories(data)
      // setLoading(false)
    }
    else {
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + error.message
      })
      // throw Error("Unable to set Categories: " +  error)
    }
    // console.log('Categories is: ', data)
  }


  //fetch functions
  const getItems = async () => {
    setLoading(true)
    // await sleep(1000)
    const { data, error } = await supabase
      .from('v_inventory')
      .select('itemId, itemName,quantity')
    if (!error) {
      setItems(data)
      setItemsList(data)
      setLoading(false)
    } else {
      setLoading(false)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + error.message
      })
    }
  }

  const onLoad = async () => {
    setLoading(true)
    await getCategories()
    await getItems()
  }


  const onItemFilterChange = (value: string) => {
    setFilterCategory('')
    setFilterValue(value);
    const filteredItems = items?.filter((a: any) => a.itemName.includes(value.toUpperCase()))
    setItemsList(filteredItems)
  }

  const onCategoryFilterChange = (val: string) => {
    setFilterCategory(val)
    setFilterValue('');
    if (val) {
      const filteredItems = items?.filter((a: any) => a.categoryId === Number(val))
      setItemsList(filteredItems)
    } else {
      setItemsList(items)
    }
  }

  const resetFilters = () => {
    setItemsList(items)
    setFilterValue('')
    setFilterCategory('')
  }


  useEffect(() => {
    onLoad()
  }, [])

  if(loading){
    return (<div className="flex flex-col items-center">
      <LoaderIcon className="animate-spin my-5" />
      <p className="animate-bounce">Loading data ...</p>
    </div>)
  }

  return (
    <div className="max-w-sm mx-auto px-1 pb-5">
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
              <BreadcrumbItem>
                <BreadcrumbPage>Inventory</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="text-center text-xl">Inventory List</div>
      </section>

      <div className="flex flex-col gap-2 items-center mb-2">
        {loading && <LoaderIcon className="animate-spin" />}
        <Select onValueChange={(val) => onCategoryFilterChange(val)} value={filterCategory} >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a Category" />
          </SelectTrigger>
          <SelectContent >
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.categoryName}
              </SelectItem>
            ))
            }
          </SelectContent>
        </Select>
        <Input
          // className="w-full "
          placeholder="Search by Item name..."
          value={filterValue}
          onChange={(e) => onItemFilterChange(e.target.value)}
        />
        <div className="flex justify-between mb-2 w-full">
          <Button variant={"ghost"} onClick={resetFilters} className="text-red-700"> <Cross1Icon className="mr-2 text-red-700" />Clear Filter</Button>

          <Button asChild size="icon" variant={"ghost"}>
            <Link to="/inventory/new"><PlusCircleIcon /></Link>
          </Button>
        </div>
      </div>
      <div id="ItemsList">
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-auto">Sl</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead className="w-[25%]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemList?.map((item, index) =>
              <TableRow key={index + 1} className={clsx(item.quantity < 0 && "bg-red-700 text-white")}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{item.itemName}</TableCell>
                <TableCell className="text-right">{item.quantity}</TableCell>
                <TableCell colSpan={2}>
                  <Sheet>
                    <SheetTrigger><DashboardIcon /></SheetTrigger>
                    <SheetContent side="bottom" className="min-h-[40%]  px-0">
                      <SheetHeader>
                        <SheetTitle>{item.itemName}</SheetTitle>
                        <SheetDescription>
                          Available Quantity: {item.quantity} pcs
                        </SheetDescription>
                      </SheetHeader>
                      <InventoryTxnDetails itemId={item.itemId} />
                    </SheetContent>

                  </Sheet>
                  <Button asChild size="icon" variant={"ghost"}>
                    <Link to={"/inventory/details/" + item.itemId}><PaperPlaneIcon /></Link>
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>

  )
}
export default InventoryListScreen