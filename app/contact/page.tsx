"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ResponsiveNavbar } from "@/components/responsive-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Users } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.")
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: ""
    })
    setIsSubmitting(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <ResponsiveNavbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute -top-40 -right-40 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-adoody">
              تواصل معنا
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mb-6 rounded-full" />
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed font-entezar-new">
              نحن هنا للاستماع إليك ومساعدتك في أي استفسار حول الأرشيف الرقمي للشهداء
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-white font-mj-ghalam">
                    أرسل لنا رسالة
                  </CardTitle>
                  <p className="text-white/70 font-dg-mataryah">
                    املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 font-dg-mataryah">
                          الاسم الكامل *
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                          placeholder="أدخل اسمك الكامل"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 font-dg-mataryah">
                          البريد الإلكتروني *
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                          placeholder="example@email.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 font-dg-mataryah">
                          رقم الهاتف
                        </label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                          placeholder="+961 XX XXX XXX"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 text-sm font-bold mb-2 font-dg-mataryah">
                          الموضوع *
                        </label>
                        <Input
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                          placeholder="موضوع الرسالة"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/80 text-sm font-bold mb-2 font-dg-mataryah">
                        الرسالة *
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 font-dg-mataryah"
                        placeholder="اكتب رسالتك هنا..."
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white py-3 text-lg font-bold font-dg-mataryah"
                    >
                      {isSubmitting ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <Send className="w-5 h-5 ml-2" />
                          إرسال الرسالة
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-8"
            >
              {/* Contact Cards */}
              <div className="space-y-6">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold font-mj-ghalam">البريد الإلكتروني</h3>
                        <p className="text-white/70 font-dg-mataryah">info@martyrsarchive.org</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold font-mj-ghalam">الهاتف</h3>
                        <p className="text-white/70 font-dg-mataryah">+961 1 234 567</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold font-mj-ghalam">العنوان</h3>
                        <p className="text-white/70 font-dg-mataryah">بيروت، لبنان</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* FAQ Section */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-white font-mj-ghalam">
                    الأسئلة الشائعة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-white font-semibold font-dg-mataryah">كيف يمكنني إضافة شهيد جديد؟</h4>
                    <p className="text-white/70 text-sm font-entezar-new">يمكنك استخدام صفحة "إضافة شهيد" لإدخال المعلومات والصور.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold font-dg-mataryah">هل الموقع مجاني؟</h4>
                    <p className="text-white/70 text-sm font-entezar-new">نعم، جميع خدمات الأرشيف مجانية تماماً.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold font-dg-mataryah">كم يستغرق الرد على الاستفسارات؟</h4>
                    <p className="text-white/70 text-sm font-entezar-new">نحاول الرد خلال 24-48 ساعة من استلام الرسالة.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Stats */}
              <Card className="bg-gradient-to-br from-red-600/20 to-red-800/20 backdrop-blur-xl border-red-500/30">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="flex items-center justify-center mb-2">
                        <MessageCircle className="w-8 h-8 text-red-400" />
                      </div>
                      <div className="text-2xl font-bold text-white font-entezar">1,247</div>
                      <div className="text-white/70 text-sm font-dg-mataryah">رسالة مستلمة</div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-2">
                        <Clock className="w-8 h-8 text-green-400" />
                      </div>
                      <div className="text-2xl font-bold text-white font-entezar">24</div>
                      <div className="text-white/70 text-sm font-dg-mataryah">ساعة متوسط الرد</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
