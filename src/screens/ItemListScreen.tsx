import { useEffect, useState } from "react"
import supabase from "../utils/supabase"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import ItemComponent from "@/components/ItemComponent"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TCategoryList } from "@/utils/types"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { LoaderIcon, PlusCircleIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Cross1Icon } from "@radix-ui/react-icons"
// import { sleep } from "@/lib/utils"
// import { TItems } from "@/utils/types"

// type TItems = {
//   id: number,
//   itemName: string,
//   forSale: boolean,
//   forStock: boolean,
//   itemCategories: { categoryName: string }
// }

function ItemListScreen() {

  const [items, setItems] = useState<any>()
  const [itemList, setItemsList] = useState<any>()
  const [filterValue, setFilterValue] = useState("");
  const [categories, setCategories] = useState<TCategoryList[]>()
  const [filterCategory, setFilterCategory] = useState('')
  const [loading, setLoading] = useState(true)

  //fetch functions
  const getItems = async () => {
    // await sleep(10000)
    const { data, error } = await supabase
      .from('items')
      .select('id, itemName,itemCategories(categoryName), forSale,forStock, categoryId')
      .order('created_at',{ascending: false})
    if (!error) {
      setItems(data)
      setItemsList(data)
    } else {
      setLoading(false)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + error.message
      })
    }
  }

  const getCategories = async () => {
    // await sleep(10000)
    const { data, error } = await supabase
      .from('itemCategories')
      .select('id, categoryName')
    if (data) {
      setCategories(data)
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
    // console.log('Categories is: ', data)
  }

  //start of filter logic
  const resetFilters = () => {
    setItemsList(items)
    setFilterValue('')
    setFilterCategory('')
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

  useEffect(() => {
    getItems()
    getCategories()
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
                <BreadcrumbPage>Items</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="text-center text-xl">List of Items</div>
      </section>

      <div className="flex flex-col gap-2 items-center mb-2">
        {/* {loading && <LoaderIcon className="animate-spin" />} */}
        {/* <div>category: {filterCategory}</div> */}
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
      </div>
      <div className="flex justify-between mb-2">
        <Button variant={"ghost"} onClick={resetFilters} className="text-red-700"> <Cross1Icon className="mr-2 text-red-700"/>Clear Filter</Button>

        <Button asChild size="icon" variant={"ghost"}>
          <Link to="/items/new"><PlusCircleIcon/></Link>
        </Button>
      </div>

      {/* @ts-ignore */}
      {itemList?.map((item: TItems, index) =>
        <div key={item.id} className="flex flex-col mb-2">
          <ItemComponent item={item} typeScreen='Items' index={index + 1} />
        </div>
      )}

    </div>
  )
}
export default ItemListScreen