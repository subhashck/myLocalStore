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
import SalesList from './screens/SalesListScreen.tsx'
import InventoryScreen from './screens/InventoryScreen.tsx'
import PurchaseScreen from './screens/PurchaseScreen.tsx'
import PurchaseListScreen from './screens/PurchaseListScreen.tsx'
import InventoryListScreen from './screens/InventoryListScreen.tsx'
import ReportScreen from './screens/ReportScreen.tsx'
import ReportsListScreen from './screens/ReportsListScreen.tsx'

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
        path: "sales/new",
        element: <SalesScreen/> ,
      },
      {
        path: "sales",
        element: <SalesList/> ,
      },
      {
        path: "expenses/new",
        element: <PurchaseScreen/> ,
      },
      {
        path:"expenses",
        element: <PurchaseListScreen/> ,
      },
      {
        path: "inventory",
        element: <InventoryListScreen/> ,
      },
      {
        path: "inventory/new",
        element: <InventoryScreen mode="NEW"/> ,
      },
      {
        path: "inventory/details/:itemId",
        element: <InventoryScreen mode="VIEW"/> ,
      },
      {
        path: "reports",
        element: <ReportsListScreen/> ,
      },
      {
        path: "reports/new",
        element: <ReportScreen mode="NEW"/> ,
      },
      {
        path: "reports/view/:reportDate",
        element: <ReportScreen mode="VIEW"/> ,
      }
    ],
    //   {
    //     path: "purchase",
    //     element: <PurchaseScreen/> ,
    //   },
    //   ,
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
