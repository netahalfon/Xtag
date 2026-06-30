"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import type { User } from "@/types/user"
import { WorkerDetails } from "./worker-details"

const roleLabels: Record<User["role"], string> = {
  worker: "עובד",
  manager: "מנהל",
  admin: "אדמין",
}

interface AllWorkersProps {
  users: User[]
}

export function AllWorkers({ users }: AllWorkersProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [usersState, setUsersState] = useState<User[]>(users)

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return usersState.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        String(u.employee_number ?? "").toLowerCase().includes(q)
    )
  }, [usersState, searchQuery])

  const handleRowClick = (user: User) => setSelectedUser(user)

  const handleUserUpdated = (updated: User) => {
    setUsersState((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    setSelectedUser(updated)
  }

    const handleUserDeleted = (userId: string) => {
    setUsersState((prev) => prev.filter((u) => u.id !== userId))
    setSelectedUser(null)
  }

  if (selectedUser) {
    return (
      <WorkerDetails
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
        onSaved={handleUserUpdated}
        onDeleted={handleUserDeleted}
      />
    )
  }

  return (
    <div dir="rtl" className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-black">כל העובדים</h1>

        <div className="sticky top-20 z-40 -mx-1 mb-4 bg-white px-1 py-3 relative">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="    חיפוש לפי שם / מספר עובד..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div className="rounded-lg border border-gray-200">
          <table className="w-full caption-bottom text-sm">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="sticky top-[144px] z-30 bg-gray-50 text-right text-black font-semibold shadow-sm">שם</TableHead>
                <TableHead className="sticky top-[144px] z-30 bg-gray-50 text-right text-black font-semibold shadow-sm">מספר עובד</TableHead>
                <TableHead className="sticky top-[144px] z-30 bg-gray-50 text-right text-black font-semibold shadow-sm">אימייל</TableHead>
                <TableHead className="sticky top-[144px] z-30 bg-gray-50 text-right text-black font-semibold shadow-sm">תפקיד</TableHead>
                <TableHead className="sticky top-[144px] z-30 bg-gray-50 text-right text-black font-semibold shadow-sm">שכר (רגיל)</TableHead>
                <TableHead className="sticky top-[144px] z-30 bg-gray-50 text-right text-black font-semibold shadow-sm">שכר (מנהל)</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    לא נמצאו עובדים
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    onClick={() => handleRowClick(user)}
                    className="cursor-pointer hover:bg-orange-50 transition-colors"
                  >
                    <TableCell className="text-right font-medium text-black">{user.full_name}</TableCell>
                    <TableCell className="text-right text-gray-700">{user.employee_number ?? "—"}</TableCell>
                    <TableCell className="text-right text-gray-700">{user.email}</TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                        {roleLabels[user.role]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-black">₪{user.salary_regular.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-black">
                      {user.salary_manager !== null ? `₪${user.salary_manager.toLocaleString()}` : "0"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </table>
        </div>
      </div>
    </div>
  )
}
