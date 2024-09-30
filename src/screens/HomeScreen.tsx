import { Button } from "@/components/ui/button"
import supabase from "../utils/supabase"

function HomeScreen() {

    const login = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            // options: {
            //   redirectTo: `${location.origin}/auth/callback`,
            // },
        })
    }

    const logout = async () => {
        await supabase.auth.signOut()
    }

    return (
        <div className="grid grid-rows-3 h-screen py-2 gap-5 px-2 max-w-sm mx-auto">
            <div className="row-span-2 flex-row text-center text-4xl">
                Welcome to 
                <p>Dukan Store App</p>
            </div>
            <div className="flex flex-col gap-5">
                <Button onClick={() => login()}>Login with Google</Button>
                <Button onClick={() => logout()}>Sign out</Button>
            </div>
        </div>
    )

}
export default HomeScreen
