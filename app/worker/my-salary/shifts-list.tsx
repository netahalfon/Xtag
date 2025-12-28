"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Shift {
  id: string
  shift_date: string
  location: string
  event_name: string
  manager: string
  start_time?: string
  end_time?: string
  total_hours?: number
  hourly_rate?: number
  wage_bonus?: number
  travel_amount?: number
  shifts_pay_total?: number
}

interface ShiftsListProps {
  shifts: Shift[]
}

export function ShiftsList({ shifts }: ShiftsListProps) {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth())
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())

  // Generate year options (current year ± 2 years)
  const yearOptions = useMemo(() => {
    const years = []
    for (let i = -2; i <= 2; i++) {
      years.push(currentDate.getFullYear() + i)
    }
    return years
  }, [currentDate])

  // Month names in Hebrew
  const monthNames = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ]

  // Filter shifts by selected month and year
  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.shift_date)
      return shiftDate.getMonth() === selectedMonth && shiftDate.getFullYear() === selectedYear
    })
  }, [shifts, selectedMonth, selectedYear])

  // Calculate total salary
  const totalSalary = useMemo(() => {
    return filteredShifts.reduce((sum, shift) => {
      return sum + (shift.shifts_pay_total || 0)
    }, 0)
  }, [filteredShifts])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header with filters */}
        <div className="mb-8">
          <h1 className="mb-6 text-3xl font-bold text-black">המשמרות שלי</h1>

          <div className="flex flex-wrap gap-4">
            {/* Month selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm font-medium text-black">חודש</label>
              <Select
                value={selectedMonth.toString()}
                onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
              >
                <SelectTrigger className="border-orange-500 bg-white text-black focus:ring-orange-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year selector */}
            <div className="flex-1 min-w-[200px]">
              <label className="mb-2 block text-sm font-medium text-black">שנה</label>
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
              >
                <SelectTrigger className="border-orange-500 bg-white text-black focus:ring-orange-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Shifts list */}
        <div className="mb-8 overflow-x-auto">
          {filteredShifts.length === 0 ? (
            <Card className="p-8 text-center border-orange-200">
              <p className="text-black/60">לא נמצאו משמרות לתקופה זו</p>
            </Card>
          ) : (
            <Card className="border-orange-200 shadow-sm">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-orange-50 border-b-2 border-orange-500">
                    <th className="p-3 text-right text-sm font-bold text-black">תאריך</th>
                    <th className="p-3 text-right text-sm font-bold text-black">אירוע</th>
                    <th className="p-3 text-right text-sm font-bold text-black">מיקום</th>
                    <th className="p-3 text-right text-sm font-bold text-black">מנהל</th>
                    <th className="p-3 text-right text-sm font-bold text-black">התחלה</th>
                    <th className="p-3 text-right text-sm font-bold text-black">סיום</th>
                    <th className="p-3 text-right text-sm font-bold text-black">שעות</th>
                    <th className="p-3 text-right text-sm font-bold text-black">תעריף/שעה</th>
                    <th className="p-3 text-right text-sm font-bold text-black">בונוס</th>
                    <th className="p-3 text-right text-sm font-bold text-black">נסיעות</th>
                    <th className="p-3 text-right text-sm font-bold text-black bg-orange-100">סה"כ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShifts.map((shift, index) => (
                    <tr
                      key={shift.id}
                      className={`border-b border-orange-100 hover:bg-orange-50/50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      <td className="p-3 text-sm text-black font-medium">{formatDate(shift.shift_date)}</td>
                      <td className="p-3 text-sm text-black">{shift.event_name}</td>
                      <td className="p-3 text-sm text-black">{shift.location}</td>
                      <td className="p-3 text-sm text-black">{shift.manager}</td>
                      <td className="p-3 text-sm text-black">{shift.start_time || "-"}</td>
                      <td className="p-3 text-sm text-black">{shift.end_time || "-"}</td>
                      <td className="p-3 text-sm text-black font-medium">
                        {shift.total_hours ? shift.total_hours.toFixed(1) : "-"}
                      </td>
                      <td className="p-3 text-sm text-black">{shift.hourly_rate ? `₪${shift.hourly_rate}` : "-"}</td>
                      <td className="p-3 text-sm text-orange-600 font-medium">
                        {shift.wage_bonus && shift.wage_bonus > 0 ? `₪${shift.wage_bonus}` : "-"}
                      </td>
                      <td className="p-3 text-sm text-black">
                        {shift.travel_amount ? `₪${shift.travel_amount}` : "-"}
                      </td>
                      <td className="p-3 text-sm text-black font-bold bg-orange-50">
                        {shift.shifts_pay_total ? `₪${shift.shifts_pay_total.toLocaleString("he-IL")}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        {/* Total salary card */}
        <Card className="border-orange-500 bg-gradient-to-br from-orange-50 to-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">סה"כ משכורת</h2>
            <p className="text-3xl font-bold text-orange-500">₪{totalSalary.toLocaleString("he-IL")}</p>
          </div>
          <p className="mt-2 text-sm text-black/60">
            {filteredShifts.length} משמרות ב-{monthNames[selectedMonth]} {selectedYear}
          </p>
        </Card>
      </div>
    </div>
  )
}
