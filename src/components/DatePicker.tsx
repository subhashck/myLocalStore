import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Calendar } from "./ui/calendar"
import { format } from "date-fns"

function DatePicker({filterDate,setDate}: {filterDate: Date|undefined, setDate:(filterDate:Date|undefined)=>void}) {
    // const [date, setDatea] = useState<Date>()
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !filterDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDate ? format(filterDate, "PPP") : <span>Pick a date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={filterDate}
                    onSelect={setDate}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    )
}
export default DatePicker
