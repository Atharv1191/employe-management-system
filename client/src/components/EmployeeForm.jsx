import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DEPARTMENTS } from '../assets/assets';
import { Loader2Icon } from 'lucide-react';
import api from '../api/axios'
import toast from 'react-hot-toast';

const EmployeeForm = ({ initialData, onSuccess, onCancel }) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);
    const isEditMode = !!initialData;  // ✅ Fix 1: typo "isEditeMode" → "isEditMode"
    const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget);
    
    // ✅ FormData ko JSON object mein convert karo
    const data = Object.fromEntries(formData.entries());
    
    if (isEditMode) {
        if (!data.password) delete data.password
    }

    try {
        const url = isEditMode ? `/employees/${initialData.id}` : "/employees";
        const method = isEditMode ? "put" : "post"
        await api[method](url, data)  // ✅ JSON jayega ab
        onSuccess ? onSuccess() : navigate("/employees")
    } catch (error) {
        toast.error(error.message)
    } finally {
        setLoading(false)
    }
}
    
    return (
        <form className='space-y-6 max-w-3xl animate-fade-in' onSubmit={handleSubmit}>

            {/* personal information */}
            <div className='card p-4 sm:p-6'>
                <h3 className='font-medium mb-6 pb-4 border-b border-slate-100'>Personal information</h3>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700'>
                    <div>
                        <label className='block mb-2'>First Name</label>
                        <input name='firstName' required defaultValue={initialData?.firstName} />
                    </div>

                    <div>
                        <label className='block mb-2'>Last Name</label>
                        <input name='lastName' required defaultValue={initialData?.lastName} />
                    </div>

                    <div>
                        <label className='block mb-2'>Phone Number</label>
                        <input name='phone' required defaultValue={initialData?.phone} />
                    </div>

                    <div>
                        <label className='block mb-2'>Join Date</label>
                        <input
                            type='date'
                            name='joinDate'
                            required
                            defaultValue={
                                initialData?.joinDate
                                    ? new Date(initialData.joinDate).toISOString().split("T")[0]
                                    : ""
                            }
                        />
                    </div>

                    <div className='sm:col-span-2'>
                        <label className='block mb-2'>Bio (optional)</label>
                        <textarea
                            name='bio'
                            defaultValue={initialData?.bio}
                            rows={3}
                            className='resize-none'
                            placeholder='Brief Description'
                        />
                    </div>
                </div>
            </div>

            {/* employment details */}
            <div className='card p-5 sm:p-6'>
                <h3 className='text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100'>
                    Employment Details
                </h3>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700'>
                    <div>
                        <label className='block mb-2'>Department</label>
                        <select name="department" defaultValue={initialData?.department || ""}>
                            <option value="">Select Department</option>
                            {DEPARTMENTS.map((deptName) => (
                                <option key={deptName} value={deptName}>
                                    {deptName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2">Position</label>
                        <input name='position' required defaultValue={initialData?.position} />
                    </div>

                    <div>
                        <label className="block mb-2">Basic Salary</label>
                        <input
                            name='basicSalary'
                            step="0.01"
                            type='number'
                            required
                            defaultValue={initialData?.basicSalary || 0}
                            min="0"
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Allowances</label>
                        <input
                            type='number'
                            name='allowances'
                            min="0"
                            step="0.01"
                            required
                            defaultValue={initialData?.allowances || 0}
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Deductions</label>
                        <input
                            type='number'
                            name='deductions'
                            min="0"
                            step="0.01"
                            required
                            defaultValue={initialData?.deductions || 0}
                        />
                    </div>

                    {isEditMode && (  // ✅ Fix 1: consistent spelling
                        <div>
                            <label className="block mb-2">Status</label>
                            <select
                                name='employmentStatus'
                                required
                                defaultValue={initialData?.employmentStatus}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Account Setup */}
            <div className='card sm:p-6'>
                <h3 className='text-base font-medium text-slate-900 mb-6 pb-4 border-b border-slate-100'>Account Setup</h3>

                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm text-slate-700'>
                    <div className='sm:col-span-2'>
                        <label className='block mb-2'>Work Email</label>
                        <input type='email' name='email' required defaultValue={initialData?.email} />
                    </div>

                    {!isEditMode && (  // ✅ Fix 1: consistent spelling
                        <div>
                            <label className='block mb-2'>Temporary Password</label>
                            <input type='password' name='password' required />
                        </div>
                    )}

                    {isEditMode && (  // ✅ Fix 1: consistent spelling
                        <div>
                            <label className='block mb-2'>Change Password (optional)</label>
                            <input type='password' name='password' placeholder='Leave blank to keep current' />
                        </div>
                    )}

                    <div>
                        <label className='block mb-2'>System Role</label>
                        <select name="role" defaultValue={initialData?.user?.role || "EMPLOYEE"}>
                            <option value="EMPLOYEE">Employee</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* buttons */}
            <div className='flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2'>
                <button
                    onClick={() => (onCancel ? onCancel() : navigate(-1))}
                    className='btn-secondary'
                    type='button'
                >
                    Cancel
                </button>
                <button
                    disabled={loading}  // ✅ Fix 2: "disabledloading" → "disabled={loading}"
                    className='btn-primary flex items-center justify-center'
                    type='submit'
                >
                    {loading && <Loader2Icon className='w-4 h-4 animate-spin mr-2' />}
                    {isEditMode ? "Update Employee" : "Create Employee"}
                </button>
            </div>

        </form>
    )
}

export default EmployeeForm