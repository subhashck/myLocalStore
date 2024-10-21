import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menubar,  MenubarContent, MenubarItem, MenubarMenu,  MenubarSeparator,  MenubarTrigger } from "./ui/menubar";
import supabase from "@/utils/supabase";


export default function SiteHeader(session: { session: Session | null }) {

    const navigate = useNavigate();

    const logout = async () => {
        await supabase.auth.signOut()
        navigate("/")
    }
    
    return (

        <header className="flex items-center justify-between px-2 border-b-2">
            <div className="mr-1 my-2 w-10  ">
                <Avatar >
                    <AvatarImage src={session.session?.user.user_metadata.picture} className="rounded-full" />
                    <AvatarFallback>{session.session?.user.user_metadata.full_name}</AvatarFallback>
                </Avatar>

            </div>
            <Menubar >
                <MenubarMenu>
                    <MenubarTrigger>Home</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem> <Link to="/">Home</Link></MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem><Link to="/reports/new">Create Report</Link></MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem><Link to="/reports/">Previous Reports</Link></MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem asChild className="w-full hover:cursor-pointer"><Button  variant={"ghost"} onClick={logout}>Log Out</Button></MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Items</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>
                        <Link to="/items/new">New Item</Link> 
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>
                        <Link to="/items">Item List</Link>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Sales</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>
                        <Link to="/sales/new">New Sale</Link> 
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>
                        <Link to="/sales">Sales List</Link>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
                <MenubarMenu>
                    <MenubarTrigger>Expenses</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>
                        <Link to="/expenses/new">New Expense</Link> 
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>
                        <Link to="/expenses">Expense List</Link>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
               
            </Menubar>
            <div className="flex h-14 items-center px-4">
                {/*    
                <Sheet open={open} onOpenChange={setOpen}>

                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="">
                            <MenuIcon />
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="left">
                        <SheetHeader className="border-b-2">
                            <SheetTitle>Welcome {session.session?.user.user_metadata.full_name}</SheetTitle>
                            <SheetDescription>
                                Enjoy your day!
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex flex-col items-start">

                            {menuItems.map((item, index) => (
                                <Button
                                    key={index}
                                    variant="link"
                                    onClick={() => {
                                        setOpen(false);
                                    }}
                                >
                                    <Link to={item.url}>{item.label}</Link>
                                </Button>
                            ))}
                        </div>
                    </SheetContent>
                </Sheet> */}

                {/* <div className="mx-auto">My Store</div> */}

            </div>
        </header>
    );
}