"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Download } from "lucide-react"

export interface PayrollRow {
  fullName: string
  phone: string
  email: string
  bankDetails: string
  amountToPay: number
  travelSum: number
  totalSum: number
}

interface PayrollReportClientProps {
  initialMonth: number
  initialYear: number
  initialRows: PayrollRow[]
}

const HEBREW_MONTHS = [
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

// Generate last 5 years including current year
const getCurrentYear = () => new Date().getFullYear()
const getYearOptions = () => {
  const currentYear = getCurrentYear()
  return Array.from({ length: 5 }, (_, i) => currentYear - i)
}

export function PayrollReportClient({ initialMonth, initialYear, initialRows }: PayrollReportClientProps) {
  const [selectedYear, setSelectedYear] = useState<number>(initialYear)
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth)
  const [rows, setRows] = useState<PayrollRow[]>(initialRows)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const years = getYearOptions()

  // Fetch data when year or month changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Import the server action dynamically
        const { getPayrollReport } = await import("./actions")
        const data = await getPayrollReport({ year: selectedYear, month: selectedMonth })
        setRows(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "שגיאה בטעינת נתונים")
        setRows([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedYear, selectedMonth])

  // Calculate totals
  const totals = rows.reduce(
    (acc, row) => ({
      amountToPay: acc.amountToPay + row.amountToPay,
      travelSum: acc.travelSum + row.travelSum,
      totalSum: acc.totalSum + row.totalSum,
    }),
    { amountToPay: 0, travelSum: 0, totalSum: 0 },
  )

  // Download CSV function
  const downloadCSV = () => {
    const headers = ["שם מלא", "טלפון", "מייל", "פרטי חשבון בנק", "סכום לתשלום", "סכום נסיעות", "סכום סופי"]

    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        [
          `"${row.fullName}"`,
          `"${row.phone}"`,
          `"${row.email}"`,
          `"${row.bankDetails}"`,
          row.amountToPay,
          row.travelSum,
          row.totalSum,
        ].join(","),
      ),
      // Add totals row
      ['"סה"כ"', '""', '""', '""', totals.amountToPay, totals.travelSum, totals.totalSum].join(","),
    ]

    // Add BOM for Hebrew support in Excel
    const BOM = "\uFEFF"
    const csvContent = BOM + csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    const fileName = `payroll_${selectedYear}-${String(selectedMonth).padStart(2, "0")}.csv`
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className="w-full" dir="rtl">
      <CardHeader>
        <CardTitle className="text-2xl">דוח שכר חודשי</CardTitle>
        <CardDescription>בחר חודש ושנה לצפייה בדוח השכר</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[150px] space-y-2">
            <label className="text-sm font-medium">שנה</label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number.parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[150px] space-y-2">
            <label className="text-sm font-medium">חודש</label>
            <Select
              value={(selectedMonth - 1).toString()}
              onValueChange={(value) => setSelectedMonth(Number.parseInt(value) + 1)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HEBREW_MONTHS.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={downloadCSV} disabled={rows.length === 0 || isLoading} className="gap-2">
            <Download className="h-4 w-4" />
            הורד CSV
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">לא נמצאו נתונים לחודש ושנה שנבחרו</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !error && rows.length > 0 && (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">שם מלא</TableHead>
                  <TableHead className="text-right">טלפון</TableHead>
                  <TableHead className="text-right">מייל</TableHead>
                  <TableHead className="text-right">פרטי חשבון בנק</TableHead>
                  <TableHead className="text-right">סכום לתשלום</TableHead>
                  <TableHead className="text-right">סכום נסיעות</TableHead>
                  <TableHead className="text-right">סכום סופי</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.fullName}</TableCell>
                    <TableCell>{row.phone}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell className="text-sm">{row.bankDetails}</TableCell>
                    <TableCell className="font-medium">₪{row.amountToPay.toLocaleString("he-IL")}</TableCell>
                    <TableCell>₪{row.travelSum.toLocaleString("he-IL")}</TableCell>
                    <TableCell className="font-medium">₪{row.totalSum.toLocaleString("he-IL")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-bold">
                    סה"כ
                  </TableCell>
                  <TableCell className="font-bold">₪{totals.amountToPay.toLocaleString("he-IL")}</TableCell>
                  <TableCell className="font-bold">₪{totals.travelSum.toLocaleString("he-IL")}</TableCell>
                  <TableCell className="font-bold">₪{totals.totalSum.toLocaleString("he-IL")}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
