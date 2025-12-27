"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Plus, X, Calendar, MapPin, Users, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

type Worker = {
  id: string
  email: string
  full_name: string
}

type AssignedWorker = {
  workerId: string
  startTime: string
  endTime: string
  role: "דייל" | "מנהל" | ""
}

type Props = {
  workers: Worker[]
}

export default function ManagerAddShiftsClient({ workers }: Props) {
  const [eventDate, setEventDate] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [eventName, setEventName] = useState("")
  const [teamManager, setTeamManager] = useState("")
  const [assignedWorkers, setAssignedWorkers] = useState<AssignedWorker[]>([
    { workerId: "", startTime: "", endTime: "", role: "" },
  ])

  const addWorker = () => {
    setAssignedWorkers([...assignedWorkers, { workerId: "", startTime: "", endTime: "", role: "" }])
  }

  const removeWorker = (index: number) => {
    if (assignedWorkers.length > 1) {
      setAssignedWorkers(assignedWorkers.filter((_, i) => i !== index))
    }
  }

  const updateWorker = (index: number, field: keyof AssignedWorker, value: string) => {
    const updated = [...assignedWorkers]
    updated[index] = { ...updated[index], [field]: value }
    setAssignedWorkers(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = {
      eventDate,
      eventLocation,
      eventName,
      teamManager,
      assignedWorkers: assignedWorkers.map((aw) => ({
        ...aw,
        worker: workers.find((w) => w.id === aw.workerId),
      })),
    }
    console.log("טופס נשלח:", formData)
    // Handle submission logic here
  }

  const getWorkerDisplay = (worker: Worker) => {
    return `${worker.full_name} (${worker.email})`
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2"> הוספת משמרת </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Details Section */}
          <Card className="p-6 border-2 border-indigo-100 dark:border-indigo-900/30 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-6">
              <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900/30 p-2">
                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">פרטי אירוע</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventName" className="text-slate-700 dark:text-slate-300">
                  שם האירוע
                </Label>
                <Input
                  id="eventName"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="קונצרט קיץ 2024"
                  required
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventDate" className="text-slate-700 dark:text-slate-300">
                  תאריך האירוע
                </Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventLocation" className="text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    מיקום האירוע
                  </div>
                </Label>
                <Input
                  id="eventLocation"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="גן סקר, תל אביב"
                  required
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teamManager" className="text-slate-700 dark:text-slate-300">
                  שם מנהל הצוות
                </Label>
                <Input
                  id="teamManager"
                  value={teamManager}
                  onChange={(e) => setTeamManager(e.target.value)}
                  placeholder="יוסי כהן"
                  required
                  className="border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500"
                />
              </div>
            </div>
          </Card>

          {/* Assigned Workers Section */}
          <Card className="p-6 border-2 border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/30 p-2">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">עובדים משובצים</h2>
              </div>
              <Button
                type="button"
                onClick={addWorker}
                variant="outline"
                size="sm"
                className="border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 bg-transparent"
              >
                <Plus className="h-4 w-4 ml-2" />
                הוסף עובד
              </Button>
            </div>

            <div className="space-y-4">
              {assignedWorkers.map((assignedWorker, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative rounded-lg border-2 p-4 transition-all",
                    "border-slate-200 dark:border-slate-700",
                    "hover:border-emerald-200 dark:hover:border-emerald-800",
                    "bg-slate-50 dark:bg-slate-800/50",
                  )}
                >
                  {assignedWorkers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorker(index)}
                      className="absolute left-2 top-2 h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2 lg:col-span-2">
                      <Label className="text-slate-700 dark:text-slate-300">עובד</Label>
                      <Select
                        value={assignedWorker.workerId}
                        onValueChange={(value) => updateWorker(index, "workerId", value)}
                        required
                      >
                        <SelectTrigger className="border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900">
                          <SelectValue placeholder="בחר עובד" />
                        </SelectTrigger>
                        <SelectContent>
                          {workers.map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{worker.full_name}</span>
                                <span className="text-xs text-slate-500">{worker.email}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          שעת התחלה
                        </div>
                      </Label>
                      <Input
                        type="time"
                        value={assignedWorker.startTime}
                        onChange={(e) => updateWorker(index, "startTime", e.target.value)}
                        required
                        className="border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          שעת סיום
                        </div>
                      </Label>
                      <Input
                        type="time"
                        value={assignedWorker.endTime}
                        onChange={(e) => updateWorker(index, "endTime", e.target.value)}
                        required
                        className="border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2 lg:col-span-4">
                      <Label className="text-slate-700 dark:text-slate-300">תפקיד</Label>
                      <Select
                        value={assignedWorker.role}
                        onValueChange={(value) => updateWorker(index, "role", value)}
                        required
                      >
                        <SelectTrigger className="border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900">
                          <SelectValue placeholder="בחר תפקיד" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="דייל">דייל</SelectItem>
                          <SelectItem value="מנהל">מנהל</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-8"
            >
              שלח משמרת
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
