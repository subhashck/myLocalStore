import { useCallback, useEffect, useState } from "react"
import supabase from "../utils/supabase"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { Input } from "@/components/ui/input"
import ItemComponent from "@/components/ItemComponent"
import { TItems } from "@/utils/types"

// type TItems = {
//   id: number,
//   itemName: string,
//   forSale: boolean,
//   forStock: boolean,
//   itemCategories: { categoryName: string }
// }

function ItemListScreen() {

  const [items, setItems] = useState<unknown>()
  const [filterValue, setFilterValue] = useState("");

  const getItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('id, itemName,itemCategories(categoryName), forSale,forStock')
    if (!error) setItems(data)

    // const itemList: TItems[] = Items
    setItems(data)
  }

  const onSearchChange = useCallback((value?: string) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = useCallback(() => {
    setFilterValue("")
  }, [])

  useEffect(() => {
    getItems()
  }, [])

  return (
    <div className="max-w-sm mx-auto px-1">
      <div className="flex flex-row gap-2 items-center mb-2">
        <Input
          className="w-full "
          placeholder="Search by Item name..."
          value={filterValue}
          onChange={()=>onSearchChange()}
        />
        {/* <Button color="primary" startContent={<HiPlusSmall />} variant="flat"> */}
        {/* <Link to="/items/new">New</Link> */}
        <Button asChild
          variant="outline"
        >
          <Link to="/items/new">New</Link> 
        </Button>
        {/* </Button> */}
      </div>

      {/* @ts-ignore */}
      {items?.map((item: TItems, index) =>
        <div key={item.id} className="flex flex-col mb-2">
          <ItemComponent item={item} typeScreen='Items' index={index+1}/>
        </div>
      )}

    </div>
  )
}
export default ItemListScreen