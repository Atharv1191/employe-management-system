const mongoose = require("mongoose");
const DEPARTMENTS = require("../constants/departments"); 

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
    },
    firstName: {
      type: String,       
      required: true,
    },
    lastName: {
      type: String,       
      required: true,
    },
    email: {
      type: String,       
      required: true,
      unique: true,       
    },
    phone: {
      type: String,       
      required: true,
    },
    position: {
      type: String,      
      required: true,
    },
    basicSalary: {
      type: Number,
      default: 0,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    employeeStatus: {
      type: String,       // ✅
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",  // ✅ fixed typo "defalut" → "default"
    },
    joinDate: {
      type: Date,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    bio: {
      type: String,       
      default: "",
    },
    department: {
      type: String,       
      enum: DEPARTMENTS,  
      required: true,     
    },
  },
  { timestamps: true }
);

const Employee =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

module.exports = Employee;