"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"

/**
 * ContactForm Component
 * 
 * A public-facing form for users to send inquiries.
 * 
 * Features:
 * - Form validation (required fields)
 * - File upload support (UI only, backend integration pending)
 * - Conditional rendering for Order Number field
 * - Submits data to POST /api/v1/contact
 * - Loading state and toast notifications
 */
export function ContactForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    orderNumber: "",
    message: ""
  })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { name, email, subject, message, orderNumber, phone } = formData

    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast({ title: "Required fields missing", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', name);
      formDataToSend.append('email', email);
      formDataToSend.append('subject', subject);
      formDataToSend.append('message', message);
      if (phone) formDataToSend.append('phone', phone);
      if (orderNumber) formDataToSend.append('order_number', orderNumber);
      if (file) formDataToSend.append('attachment', file);

      // Using raw fetch to handle FormData correctly (browser sets Content-Type/boundary)
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/contact`, {
        method: 'POST',
        headers: headers,
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      if (data.success) {
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          orderNumber: "",
          message: ""
        })
        setFile(null)

        toast({
          title: "Message sent successfully!",
          description: "Our team will get back to you within 24 hours."
        })
      }
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 12345 67890"
          />
        </div>
        <div className="space-y-2">
          <Label>Subject <span className="text-red-500">*</span></Label>
          <Select
            value={formData.subject}
            onValueChange={(value) => setFormData({ ...formData, subject: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Inquiry</SelectItem>
              <SelectItem value="order">Order Support</SelectItem>
              <SelectItem value="product">Product Questions</SelectItem>
              <SelectItem value="wholesale">Wholesale Inquiry</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="orderNumber">Order Number <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input
          id="orderNumber"
          name="orderNumber"
          value={formData.orderNumber}
          onChange={handleChange}
          placeholder="e.g., ORD123456"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Your Message <span className="text-red-500">*</span></Label>
        <Textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="min-h-36"
          placeholder="How can we help you today?"
        />
      </div>



      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <p className="text-sm text-muted-foreground">
          <span className="text-red-500">*</span> Required fields
        </p>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#2D5F3F] hover:bg-[#234A32] text-white px-8 h-11 w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : 'Send Message'}
        </Button>
      </div>
    </form>
  )
}
