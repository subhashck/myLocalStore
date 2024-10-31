
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { TVendor, vendorSchema } from "@/utils/types"

function VendorComponent({onSave}:{onSave:(vendor:TVendor)=>void}) {


    const form = useForm<TVendor>({
        resolver: zodResolver(vendorSchema),
        mode: 'all',
        defaultValues: {
            vendorName: '',
            vendorAddress:'',
            vendorPhone: 9999999999
          }
    })

    const onSubmit =  (values: TVendor) => {
        onSave(values)
     }

    return (
        <div className="">
            <Form {...form}>
                {/* <form onSubmit={form.handleSubmit(onSubmit)} > */}
                    <div className="grid grid-flow-row gap-2 px-2">
                        <FormField
                            control={form.control}
                            name="vendorName"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="grid grid-cols-4 items-center">
                                        <FormLabel className="col-span-1 text-left">Name</FormLabel>
                                        <FormControl className="col-span-3">
                                            <Input type="text" placeholder="Vendor Name" {...field} />
                                        </FormControl>
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
                                        <FormLabel className="col-span-1 text-left">Address</FormLabel>
                                        <FormControl className="col-span-3">
                                            <Input type="text" placeholder="Vendor Address" {...field} />
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
                                        <FormLabel className="col-span-1 text-left">Phone</FormLabel>
                                        <FormControl className="col-span-3">
                                            <Input type="number" placeholder="Vendor Phone" {...field} />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type='button' className="bg-green-700" onClick={()=>onSubmit(form.getValues())}> Save</Button>
                    </div>
                {/* </form> */}
            </Form>
        </div>
    )
}
export default VendorComponent