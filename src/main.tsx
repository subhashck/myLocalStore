import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen.tsx'
import ItemListScreen from './screens/ItemListScreen.tsx'
import ItemScreen from './screens/ItemScreen.tsx'
import ErrorScreen from './screens/ErrorScreen.tsx'
import SalesScreen from './screens/SalesScreen.tsx'
import SalesPaymentScreen from './screens/SalesPaymentScreen.tsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    errorElement:<ErrorScreen/>,
    children: [
      {
        path: "/",
        element: <HomeScreen/>
      },
    //   {
    //     path: "/auth/callback",
    //     element: <HomeScreen/>
    //   },
      {
        path: "items",
        element: <ItemListScreen/> ,
      },
      {
        path: "items/new",
        element: <ItemScreen/> ,
      },
      {
        path: "items/edit/:itemId",
        element: <ItemScreen mode="edit"/> ,
      },
      {
        path: "sales",
        element: <SalesScreen/> ,
      },
      {
        path: "sales/payment",
        element: <SalesPaymentScreen/> ,
      }],
    //   {
    //     path: "purchase",
    //     element: <PurchaseScreen/> ,
    //   },
    //   {
    //     path: "inventory",
    //     element: <InventoryScreen/> ,
    //   },
    //   {
    //     path: "reports",
    //     element: <ReportScreen/> ,
    //   },
    // ],
  },
]);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}>
    </RouterProvider>
  </StrictMode>,
)
