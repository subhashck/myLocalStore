import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import supabase from "./utils/supabase"
import { Session } from "@supabase/supabase-js"
import SiteHeader from "./components/SiteHeader"
import { Toaster } from "./components/ui/toaster"

function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()

  }, [])


  return (
    <div className="dark:bg-gray-500">

      <SiteHeader session={session} />
      <div className="mt-2">
        {/* <pre>{JSON.stringify(session?.user.user_metadata)}</pre> */}
        <Toaster />
        <Outlet />
      </div>
    </div>

  )
}

export default App
