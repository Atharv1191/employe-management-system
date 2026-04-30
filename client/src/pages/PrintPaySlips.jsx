import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Loading from "../components/Loading";
import { format } from "date-fns";
import api from '../api/axios'

const PrintPaySlips = () => {
  const { id } = useParams()
  const [payslips, setPayslips] = useState(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/payslips/${id}`)
      .then((res) => setPayslips(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading />
  if (!payslips) return <p className="text-center py-12 text-slate-400">Payslip Not found</p>

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white animate-fade-in">
      <div className="text-center border-b border-slate-200 pb-6 mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">PAYSLIPS</h1>
        <p className="text-slate-500 text-sm mt-1">{format(new Date(payslips.year, payslips.month - 1), "MMMM yyyy")}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Employee Name</p>
          <p className="font-semibold text-slate-900">
            {payslips.employee?.firstName} {payslips.employee?.lastName}  {/* ✅ Fix 1: lastName */}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Position</p>
          <p className="font-semibold text-slate-900">
            {payslips.employee?.position}  {/* ✅ Fix 2: removed firstName, only position */}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Email</p>
          <p className="font-semibold text-slate-900">{payslips.employee?.email}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Period</p>
          <p className="font-semibold text-slate-900">{format(new Date(payslips.year, payslips.month - 1), "MMMM yyyy")}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left py-3 px-4 text-xs text-slate-500 uppercase tracking-wider">Description</th>
              <th className="text-right py-3 px-4 text-xs text-slate-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-100">
              <td className="py-3 px-4 text-slate-700">Basic Salary</td>
              <td className="text-right py-3 px-4 text-slate-900 font-medium">${payslips.basicSalary?.toLocaleString()}</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="py-3 px-4 text-slate-700">Allowances</td>
              <td className="text-right py-3 px-4 text-green-600 font-medium">+${payslips.allowances?.toLocaleString()}</td>
            </tr>
            <tr className="border-t border-slate-100">
              <td className="py-3 px-4 text-slate-700">Deductions</td>
              <td className="text-right py-3 px-4 text-red-500 font-medium">-${payslips.deductions?.toLocaleString()}</td>
            </tr>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td className="py-3 px-4 font-semibold text-slate-900">Net Salary</td>
              <td className="text-right py-4 px-4 text-slate-900 font-bold text-lg">${payslips.netSalary?.toLocaleString()}</td>  {/* ✅ Fix 3: minus sign hata diya */}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <button onClick={() => window.print()} className="btn-primary print:hidden">
          Print Payslip
        </button>
      </div>
    </div>
  )
}

export default PrintPaySlips