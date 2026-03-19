'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'
import UnifiedPublicLayout from '@/components/UnifiedPublicLayout'
import { useToast } from '@/hooks/use-toast'

// FIXED: Contact form now has a working onSubmit handler and API call
// Previously the form was purely decorative — submitting did nothing

export default function ContactPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  })

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = 'Please enter a valid email'
    if (!form.subject.trim()) newErrors.subject = 'Subject is required'
    if (!form.message.trim()) newErrors.message = 'Message is required'
    else if (form.message.trim().length < 10)
      newErrors.message = 'Message must be at least 10 characters'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          subject: form.subject,
          message: form.message,
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        toast({ title: 'Message sent!', description: "We'll get back to you within 24 hours." })
      } else {
        toast({
          title: 'Failed to send',
          description: 'Please try again or email us directly.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Connection error',
        description: 'Please check your internet and try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const field = (name: keyof typeof form) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [name]: e.target.value })),
  })

  return (
    <UnifiedPublicLayout variant="solid" sidebarVariant="contact">
      <div className="relative py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Contact Form */}
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Send us a Message</h2>
                  <p className="text-gray-600">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600 mb-6">
                      Thank you for reaching out. We'll respond within 24 hours.
                    </p>
                    <Button
                      onClick={() => { setSubmitted(false); setForm({ firstName: '', lastName: '', email: '', subject: '', message: '' }) }}
                      variant="outline"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Shivam"
                          className={`mt-1 ${errors.firstName ? 'border-red-400' : 'border-gray-200'}`}
                          {...field('firstName')}
                        />
                        {errors.firstName && (
                          <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Thakur"
                          className="mt-1 border-gray-200"
                          {...field('lastName')}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                        Email Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@mail.com"
                        className={`mt-1 ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                        {...field('email')}
                      />
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium text-slate-700">
                        Subject <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="How can we help you?"
                        className={`mt-1 ${errors.subject ? 'border-red-400' : 'border-gray-200'}`}
                        {...field('subject')}
                      />
                      {errors.subject && (
                        <p className="text-xs text-red-500 mt-1">{errors.subject}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="message" className="text-sm font-medium text-slate-700">
                        Message <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                        className={`mt-1 ${errors.message ? 'border-red-400' : 'border-gray-200'}`}
                        {...field('message')}
                      />
                      {errors.message && (
                        <p className="text-xs text-red-500 mt-1">{errors.message}</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Contact illustration */}
            <Card className="lg:pl-8 bg-transparent p-0 h-full">
              <div className="rounded-lg overflow-hidden h-full">
                <img
                  src="/contact.svg"
                  alt="Contact Illustration"
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>

          </div>
        </div>
      </div>
    </UnifiedPublicLayout>
  )
}
