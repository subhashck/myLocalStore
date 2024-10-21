import DatePicker from "@/components/DatePicker";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import supabase from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { CheckIcon, LoaderIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod"

type TItem = {
  id: number,
  itemName: string
}

function InventoryScreen({ mode }: { mode?: string }) {

  const navigate = useNavigate()

  const { toast } = useToast()

  let { itemId } = useParams()

  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<TItem[]>()

  const stockSchema = z.object({
    itemId: z.coerce.number().gt(0).optional(),
    itemName: z.string(),
    quantity: z.coerce.number().gt(0),
    unitName: z.string(),
    stockDate: z.date(),
    stockType: z.enum(['ADD', 'REMOVE', 'OPENING'])
  })

  const form = useForm<z.infer<typeof stockSchema>>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      quantity: 0,
      unitName: 'PCS',
      stockDate: new Date,
      stockType: 'OPENING'
    },
  })

  const { isSubmitting } = form.formState

  const onSubmit = async (values: z.infer<typeof stockSchema>) => {
    setLoading(true)
    if (values.stockType === 'REMOVE') {
      values.quantity = values.quantity * -1
    }
    const { error } = await supabase
      .from('inventoryCorrection')
      .insert(values)
    if (!error) {
      setLoading(false)
      navigate('/inventory')
      toast({
        description: 'Stock Entry saved successfully'
      })
    } else {
      setLoading(false)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + error.message
      })
    }
  }

  const getItems = async () => {
    // await sleep(10000)
    setLoading(true)
    const { data, error } = await supabase
      .from('items')
      .select('id, itemName')
    if (!error) {
      setItems(data)
      setLoading(false)
    } else {
      setLoading(false)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + error.message
      })
    }
  }

  //get item from id for VIEW & EDIT modes
  const getSingleItem = async () => {
    setLoading(true)
    // await sleep(100000)
    const { data, error } = await supabase
      .from('items')
      .select('id, itemName')
      .eq('id', itemId)
      .single()

    if (error) {
      setLoading(false)
      toast({
        variant: 'destructive',
        description: 'Error fetching from Database: ' + error.message
      })
      return
    }
    // console.info(data)
    form.setValue('itemId', data?.id)
    form.setValue('itemName', data?.itemName)
    setLoading(false)
  }


  useEffect(() => {
    setLoading(true)
    
    if (mode === 'NEW') {
      getItems()
    } else {
      getItems()
      getSingleItem()
    }

  }, [])

  // if(loading){
  //   return (<div className="flex flex-col items-center">
  //     <LoaderIcon className="animate-spin my-5" />
  //     <p className="animate-bounce">Loading data ...</p>
  //   </div>)
  // }

  return (
    <div className="max-w-sm mx-auto px-1">
      {/* {itemId} */}
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
                <BreadcrumbLink asChild>
                  <Link to="/inventory">Inventory</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Inventory Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="text-center text-xl">Inventory List</div>
      </section>

      <div className="border ">
        <div className="grid gap-2 py-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col  gap-5 px-2 ">
              <FormField
                control={form.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              disabled={mode!=='NEW'}
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? items?.find(
                                  (item) => item.itemName === field.value
                                )?.itemName
                                : "Select Item"}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search Item..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No item found.</CommandEmpty>
                              <CommandGroup>
                                {items?.map((item) => (
                                  <CommandItem
                                    value={item.itemName}
                                    key={item.itemName}
                                    onSelect={() => {
                                      form.setValue("itemName", item.itemName)
                                      form.setValue("itemId", item.id)
                                    }}
                                  >
                                    {item.itemName}
                                    <CheckIcon
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        item.itemName === field.value
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stockDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Stock</FormLabel>
                    <DatePicker filterDate={field.value} setDate={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stockType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Position Type...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="OPENING" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Opening
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ADD" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Add Quantity
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="REMOVE" />
                          </FormControl>
                          <FormLabel className="font-normal">Remove</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <div className="grid grid-flow-col gap-2 items-center">
                        <Input type="number" placeholder="Quantity" {...field} />
                        <p className="italic text-xs">pcs</p>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="bg-green-700" disabled={loading||isSubmitting}>{isSubmitting ? <LoaderIcon className="animate-spin"/> : 'Save'}</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>

  )
}
export default InventoryScreen