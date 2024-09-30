import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { MenuIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Session } from "@supabase/supabase-js";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";

export default function SiteHeader(session: { session: Session | null }) {
    const menuItems = [
        { label: "Home", url: '/' },
        { label: "Items", url: '/items' },
        { label: "Sales", url: '/sales' },
        { label: "Purchase", url: '/purchase' },
        { label: "Inventory", url: '/inventory' },
        { label: "Reports", url: '/reports' },
        { label: "Log Out", url: '/auth/logout' },

        // "Dashboard",
        // "Activity",
        // "Analytics",
        // "System",
        // "Deployments",
        // "My Settings",
        // "Team Settings",
        // "Help & Feedback",
        // "Log Out",
    ]

    const [open, setOpen] = useState(false);
    // if (session !== null) {
    //     console.log(session.session?.user.user_metadata)
    // }

    return (

        <header className="w-full border-b">
            <div className="flex h-14 items-center px-4">
                {/* <MainNav /> */}
                <Sheet open={open} onOpenChange={setOpen}>

                    {/* This button will trigger open the mobile sheet menu */}
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="">
                            <MenuIcon />
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="left">
                        <div className="flex flex-col items-start">
                        <div className="text-sm">Welcome {session.session?.user.user_metadata.full_name}</div>
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

                </Sheet>
                <div className="mx-auto">My Store</div>
                <div className="mr-1 my-2 w-10  ">
                    <Avatar >
                        <AvatarImage src={session.session?.user.user_metadata.picture} className="rounded-full"/>
                        <AvatarFallback>{session.session?.user.user_metadata.avatar_url}</AvatarFallback>
                    </Avatar>
                    
                    </div>
            </div>
        </header>
    );
}