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

        <header className="flex items-center  px-2 border-b-2   md:justify-center">
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
                <MenubarMenu>
                    <MenubarTrigger>Stock</MenubarTrigger>
                    <MenubarContent>
                        <MenubarItem>
                        <Link to="/inventory/new">New Stock entry</Link> 
                        </MenubarItem>
                        <MenubarSeparator />
                        <MenubarItem>
                        <Link to="/inventory">Stock List</Link>
                        </MenubarItem>
                    </MenubarContent>
                </MenubarMenu>
               
            </Menubar>
           
        </header>
    );
}