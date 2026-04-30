import { useEffect, useState } from "react"
import { dummyAdminDashboardData } from "../assets/assets"
import Loading from "../components/Loading"
import EmployeeDashboard from "../components/EmployeeDashboard"
import AdminDashboard from "../components/AdminDashboard"
import api from "../api/axios"

const Dashboard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard').then((res)=>setData(res.data)).catch((err)=>toast.error(error.message)).finally(()=>setLoading(false))
   
  }, [])

  if (loading) return <Loading />

  if (!data) {
    return (
      <p className="text-center text-slate-500 py-12">
        Failed to load dashboard
      </p>
    )
  }

  if (data.role === "ADMIN") {
    return <AdminDashboard data={data} />
  } else {
    return <EmployeeDashboard data={data} />
  }
}

export default Dashboard