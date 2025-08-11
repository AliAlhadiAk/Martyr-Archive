"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveNavbar } from "@/components/responsive-navbar";
import { SharedBackground } from "@/components/shared-background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  User,
  MapPin,
  Heart,
  Search,
  Filter,
  Star,
  Clock,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMartyrs } from "@/hooks/use-martyrs";
import { useDebounce } from "@/hooks/use-debounce";

const months = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const weekDays = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];

const CalendarPage = () => {
  const { data } = useMartyrs();
  const martyrs = useMemo(() => {
    const list = (data && "martyrs" in data ? (data as any).martyrs : []) as any[];
    return list.map((m) => ({
      ...m,
      date: new Date(m.martyrdomDate || m.date || new Date().toISOString()),
    }));
  }, [data]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get martyrs for the current month/year with search
  const martyrsByDate = useMemo(() => {
    const martyrsMap = new Map<string, typeof martyrs>();

    const filteredMartyrs = martyrs.filter((martyr) =>
      debouncedSearchQuery === ""
        ? true
        : martyr.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
          martyr.location?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );

    filteredMartyrs.forEach((martyr) => {
      if (viewMode === "month") {
        if (
          martyr.date.getFullYear() === currentYear &&
          martyr.date.getMonth() === currentMonth
        ) {
          const dateKey = martyr.date.getDate().toString();
          if (!martyrsMap.has(dateKey)) {
            martyrsMap.set(dateKey, []);
          }
          martyrsMap.get(dateKey)!.push(martyr);
        }
      } else {
        if (martyr.date.getFullYear() === currentYear) {
          const monthKey = martyr.date.getMonth().toString();
          if (!martyrsMap.has(monthKey)) {
            martyrsMap.set(monthKey, []);
          }
          martyrsMap.get(monthKey)!.push(martyr);
        }
      }
    });

    return martyrsMap;
  }, [martyrs, currentYear, currentMonth, viewMode, debouncedSearchQuery]);

  // Get selected date martyrs
  const selectedDateMartyrs = useMemo(() => {
    if (!selectedDate) return [];

    return martyrs.filter(
      (martyr) =>
        martyr.date.getDate() === selectedDate.getDate() &&
        martyr.date.getMonth() === selectedDate.getMonth() &&
        martyr.date.getFullYear() === selectedDate.getFullYear() &&
        (debouncedSearchQuery === ""
          ? true
          : martyr.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
            martyr.location?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
    );
  }, [martyrs, selectedDate, debouncedSearchQuery]);

  // Generate calendar days for month view
  const calendarDays = useMemo(() => {
    if (viewMode !== "month") return [];

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [currentYear, currentMonth, viewMode]);

  const navigateMonth = async (direction: number) => {
    setIsAnimating(true);
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + direction);
    } else {
      newDate.setFullYear(newDate.getFullYear() + direction);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    setCurrentDate(newDate);
    setSelectedDate(null);
    setIsAnimating(false);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const hasMartyrs = (date: Date) => {
    if (viewMode === "month") {
      return martyrsByDate.has(date.getDate().toString());
    } else {
      return martyrsByDate.has(date.getMonth().toString());
    }
  };

  const getMartyrCount = (date: Date) => {
    if (viewMode === "month") {
      return martyrsByDate.get(date.getDate().toString())?.length || 0;
    } else {
      return martyrsByDate.get(date.getMonth().toString())?.length || 0;
    }
  };

  const getIntensityColor = (count: number) => {
    if (count === 0) return "bg-white/5";
    if (count <= 2) return "bg-gradient-to-br from-red-500/40 to-orange-500/40";
    if (count <= 5) return "bg-gradient-to-br from-red-600/60 to-red-700/60";
    return "bg-gradient-to-br from-red-700/80 to-red-800/80";
  };

  return (
    <main className="min-h-screen bg-black text-white overflow-x-hidden">
      <ResponsiveNavbar />
      <SharedBackground variant="calendar" />

      {/* Hero Section */}
      <section className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold text-white mb-6 font-adoody"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              رزنامة الشهداء
            </motion.h1>

            <motion.div
              className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mb-6 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />

            <motion.p
              className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed font-entezar-new"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              استكشف تواريخ الاستشهاد وتعرف على قصص الأبطال في كل يوم من أيام
              السنة
            </motion.p>

            {/* Search */}
            <motion.div
              className="max-w-2xl mx-auto mt-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl" />
                <div className="relative bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                      <Input
                        placeholder="ابحث عن شهيد أو منطقة في التقويم..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-0 text-white placeholder:text-white/60 pr-12 h-14 text-lg font-dg-mataryah focus:ring-0"
                      />
                    </div>
                    <Button
                      className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white px-8 h-14 rounded-xl font-dg-mataryah"
                    >
                      <Filter className="w-5 h-5 ml-2" />
                      بحث
                    </Button>
                  </div>
                </div>
              </div>

              {searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <Badge className="bg-red-600/20 text-red-300 border-red-500/30 font-dg-mataryah">
                    البحث عن: "{searchQuery}"
                  </Badge>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="pb-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Calendar */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-2xl">
                  <CardHeader className="pb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigateMonth(-1)}
                          className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all duration-300"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </motion.button>

                        <motion.div
                          key={`${currentYear}-${currentMonth}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="text-center"
                        >
                          <CardTitle className="text-4xl font-bold text-white font-mj-ghalam">
                            {viewMode === "month"
                              ? `${months[currentMonth]} ${currentYear}`
                              : `${currentYear}`}
                          </CardTitle>
                          <div className="text-white/60 text-sm font-dg-mataryah mt-1">
                            {Array.from(martyrsByDate.values()).reduce(
                              (sum, martyrs) => sum + martyrs.length,
                              0
                            )}{" "}
                            شهيد
                          </div>
                        </motion.div>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigateMonth(1)}
                          className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all duration-300"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                      </div>

                      <div className="flex gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setViewMode("month")}
                          className={`px-6 py-3 rounded-xl font-dg-mataryah transition-all duration-300 ${
                            viewMode === "month"
                              ? "bg-gradient-to-r from-red-600 to-red-800 text-white"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          }`}
                        >
                          شهري
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setViewMode("year")}
                          className={`px-6 py-3 rounded-xl font-dg-mataryah transition-all duration-300 ${
                            viewMode === "year"
                              ? "bg-gradient-to-r from-red-600 to-red-800 text-white"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          }`}
                        >
                          سنوي
                        </motion.button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-8 pb-8">
                    <AnimatePresence mode="wait">
                      {viewMode === "month" ? (
                        <motion.div
                          key="month-view"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                        >
                          {/* Week Days Header */}
                          <div className="grid grid-cols-7 gap-3 mb-6">
                            {weekDays.map((day, index) => (
                              <motion.div
                                key={day}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="text-center text-white/60 text-sm font-bold py-4 font-dg-mataryah"
                              >
                                {day}
                              </motion.div>
                            ))}
                          </div>

                          {/* Calendar Days */}
                          <div className="grid grid-cols-7 gap-3">
                            {calendarDays.map((date, index) => {
                              const dayMartyrs = getMartyrCount(date);
                              const isCurrentMonthDay = isCurrentMonth(date);
                              const isTodayDate = isToday(date);
                              const isSelected =
                                selectedDate && selectedDate.getTime() === date.getTime();

                              return (
                                <motion.button
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{
                                    duration: 0.4,
                                    delay: index * 0.01,
                                    type: "spring",
                                    stiffness: 300,
                                  }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setSelectedDate(date)}
                                  className={`
                                    relative h-16 rounded-xl text-sm font-bold transition-all duration-300 font-entezar overflow-hidden
                                    ${!isCurrentMonthDay ? "text-white/30" : "text-white"}
                                    ${isTodayDate ? "ring-2 ring-blue-400" : ""}
                                    ${isSelected ? "ring-2 ring-red-400" : ""}
                                    ${dayMartyrs > 0 ? getIntensityColor(dayMartyrs) : "bg-white/5 hover:bg-white/10"}
                                  `}
                                >
                                  <div className="relative z-10">
                                    {date.getDate()}

                                    {dayMartyrs > 0 && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                          delay: index * 0.01 + 0.3,
                                          type: "spring",
                                        }}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-xs text-white font-bold"
                                      >
                                        {dayMartyrs}
                                      </motion.div>
                                    )}

                                    {isTodayDate && (
                                      <motion.div
                                        className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full"
                                        animate={{
                                          scale: [1, 1.5, 1],
                                          opacity: [0.7, 1, 0.7],
                                        }}
                                        transition={{
                                          duration: 2,
                                          repeat: Infinity,
                                        }}
                                      />
                                    )}
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        </motion.div>
                      ) : (
                        /* Year View */
                        <motion.div
                          key="year-view"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          className="grid grid-cols-3 md:grid-cols-4 gap-6"
                        >
                          {months.map((month, index) => {
                            const monthMartyrs = getMartyrCount(
                              new Date(currentYear, index, 1)
                            );

                            return (
                              <motion.button
                                key={month}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                  duration: 0.4,
                                  delay: index * 0.1,
                                  type: "spring",
                                  stiffness: 300,
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setCurrentDate(new Date(currentYear, index, 1));
                                  setViewMode("month");
                                }}
                                className={`
                                  relative p-6 rounded-xl text-center transition-all duration-300 overflow-hidden
                                  ${monthMartyrs > 0 ? getIntensityColor(monthMartyrs) : "bg-white/5 hover:bg-white/10"}
                                `}
                              >
                                <div className="relative z-10">
                                  <div className="text-white font-bold text-lg font-dg-mataryah mb-2">
                                    {month}
                                  </div>
                                  {monthMartyrs > 0 && (
                                    <>
                                      <div className="text-red-400 text-sm font-entezar mb-2">
                                        {monthMartyrs} شهيد
                                      </div>
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                          delay: index * 0.1 + 0.3,
                                          type: "spring",
                                        }}
                                        className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-sm text-white font-bold"
                                      >
                                        {monthMartyrs}
                                      </motion.div>
                                    </>
                                  )}
                                </div>
                              </motion.button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Legend */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-white font-mj-ghalam flex items-center gap-2">
                      <Star className="w-5 h-5 text-red-400" />
                      دليل الألوان
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-blue-400 rounded-lg"></div>
                      <span className="text-white/80 text-sm font-dg-mataryah">
                        اليوم الحالي
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gradient-to-br from-red-500/60 to-orange-500/60 rounded-lg"></div>
                      <span className="text-white/80 text-sm font-dg-mataryah">
                        1-2 شهيد
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gradient-to-br from-red-600/80 to-red-700/80 rounded-lg"></div>
                      <span className="text-white/80 text-sm font-dg-mataryah">
                        3-5 شهداء
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gradient-to-br from-red-700 to-red-800 rounded-lg"></div>
                      <span className="text-white/80 text-sm font-dg-mataryah">
                        أكثر من 5 شهداء
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Selected Date Info */}
              <AnimatePresence>
                {selectedDate && selectedDateMartyrs.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ duration: 0.4, type: "spring" }}
                  >
                    <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-xl border-red-500/30 rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-white font-mj-ghalam flex items-center gap-2">
                          <CalendarIcon className="w-5 h-5 text-red-400" />
                          {selectedDate.toLocaleDateString("ar-EG", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <motion.div
                          className="text-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                        >
                          <div className="text-3xl font-bold text-red-400 font-entezar">
                            {selectedDateMartyrs.length}
                          </div>
                          <div className="text-white/60 text-sm font-dg-mataryah">
                            شهيد في هذا اليوم
                          </div>
                        </motion.div>

                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {selectedDateMartyrs.slice(0, 5).map((martyr, index) => (
                            <motion.div
                              key={martyr.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <Link href={`/martyr/${martyr.id}`}>
                                <div className="bg-white/10 hover:bg-white/20 rounded-xl p-3 transition-all duration-300 cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={martyr.image || "/placeholder.svg"}
                                      alt={martyr.name}
                                      className="w-12 h-12 rounded-xl object-cover"
                                    />
                                    <div className="flex-1">
                                      <div className="text-white font-semibold text-sm font-mj-ghalam">
                                        {martyr.name}
                                      </div>
                                      <div className="flex items-center gap-3 text-white/60 text-xs font-dg-mataryah">
                                        <span className="flex items-center gap-1">
                                          <User className="w-3 h-3" />
                                          {martyr.age} سنة
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {martyr.location}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          ))}

                          {selectedDateMartyrs.length > 5 && (
                            <div className="text-center">
                              <Badge className="bg-red-600/20 text-red-300 border-red-500/30 font-dg-mataryah">
                                +{selectedDateMartyrs.length - 5} شهيد آخر
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-white font-mj-ghalam flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-400" />
                      إحصائيات{" "}
                      {viewMode === "month"
                        ? months[currentMonth]
                        : currentYear}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <motion.div
                      className="text-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="text-4xl font-bold text-red-400 font-entezar">
                        {Array.from(martyrsByDate.values()).reduce(
                          (sum, martyrs) => sum + martyrs.length,
                          0
                        )}
                      </div>
                      <div className="text-white/60 text-sm font-dg-mataryah">
                        إجمالي الشهداء
                      </div>
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <div className="text-2xl font-bold text-blue-400 font-entezar">
                          {martyrsByDate.size}
                        </div>
                        <div className="text-white/60 text-xs font-dg-mataryah">
                          {viewMode === "month" ? "أيام" : "أشهر"} الاستشهاد
                        </div>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }}>
                        <div className="text-2xl font-bold text-orange-400 font-entezar">
                          {Math.max(
                            ...Array.from(martyrsByDate.values()).map(
                              (m) => m.length
                            ),
                            0
                          )}
                        </div>
                        <div className="text-white/60 text-xs font-dg-mataryah">
                          أكبر عدد في يوم
                        </div>
                      </motion.div>
                    </div>

                    {/* Top locations */}
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-3 font-dg-mataryah flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-400" />
                        أكثر المناطق
                      </h4>
                      <div className="space-y-2">
                        {(() => {
                          const locationCounts: Record<string, number> = Array.from(
                            martyrsByDate.values()
                          )
                            .flat()
                            .reduce((acc: Record<string, number>, martyr: any) => {
                              const key = String(martyr.location ?? "غير معروف")
                              acc[key] = (acc[key] ?? 0) + 1
                              return acc
                            }, {})

                          const entries = Object.entries(locationCounts) as Array<[
                            string,
                            number
                          ]>

                          return entries
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 3)
                            .map(([location, count], index) => (
                              <motion.div
                                key={location}
                                className="flex justify-between items-center p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.02 }}
                              >
                                <span className="text-white/80 text-sm font-dg-mataryah">
                                  {location}
                                </span>
                                <Badge className="bg-red-600/20 text-red-300 border-red-500/30 font-dg-mataryah">
                                  {Number(count)}
                                </Badge>
                              </motion.div>
                            ));
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-white font-mj-ghalam flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-400" />
                      إجراءات سريعة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCurrentDate(new Date());
                        setViewMode("month");
                        setSelectedDate(null);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 rounded-xl font-dg-mataryah transition-all duration-300"
                    >
                      <CalendarIcon className="w-4 h-4 ml-2 inline" />
                      العودة لهذا الشهر
                    </motion.button>

                    <Link href="/martyrs" className="block">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-dg-mataryah transition-all duration-300"
                      >
                        <Heart className="w-4 h-4 ml-2 inline" />
                        تصفح جميع الشهداء
                      </motion.button>
                    </Link>

                    <Link href="/admin" className="block">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-dg-mataryah transition-all duration-300"
                      >
                        <User className="w-4 h-4 ml-2 inline" />
                        إدارة الأرشيف
                      </motion.button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CalendarPage;
