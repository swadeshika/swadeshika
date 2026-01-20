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

    // Trim whitespace
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    const trimmedPhone = phone.trim();

    // 1. Basic Required Fields Check (Granular)
    if (!trimmedName) {
      toast({ title: "Name Required", description: "Please enter your full name.", variant: "destructive" })
      return
    }
    if (!trimmedEmail) {
      toast({ title: "Email Required", description: "Please enter your email address.", variant: "destructive" })
      return
    }
    if (!trimmedPhone) {
      toast({ title: "Phone Required", description: "Please enter your phone number.", variant: "destructive" })
      return
    }
    if (!trimmedSubject) {
      toast({ title: "Subject Required", description: "Please select a subject for your inquiry.", variant: "destructive" })
      return
    }
    if (!trimmedMessage) {
      toast({ title: "Message Required", description: "Please enter your message.", variant: "destructive" })
      return
    }

    // 2. Email Validation (Strict)
    // Basic format check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Check 1: Regex match
    if (!emailRegex.test(trimmedEmail)) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" })
      return
    }
    
    // Check 2: No double @ (Explicit check, though regex handles it, this catches edge cases regex might miss in some engines)
    if (trimmedEmail.split('@').length !== 2) {
      toast({ title: "Invalid Email", description: "Email must contain exactly one '@' symbol.", variant: "destructive" })
      return
    }

    // Check 3: No consecutive dots or starting/ending dots
    if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
       toast({ title: "Invalid Email", description: "Email cannot contain consecutive dots or start/end with a dot.", variant: "destructive" })
       return
    }

    // Check 4: Domain part validity (at least one dot after @)
    const domainPart = trimmedEmail.split('@')[1];
    if (domainPart.indexOf('.') === -1) {
       toast({ title: "Invalid Email", description: "Email domain must contain a valid extension (e.g., .com).", variant: "destructive" })
       return
    }

    // Check 5: Forbidden special chars often used in attacks or typos
    if (/[#&,;]/.test(trimmedEmail)) {
       toast({ title: "Invalid Email", description: "Email contains invalid characters.", variant: "destructive" })
       return
    }

    // 3. Phone Validation (10 digits only, numeric)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      toast({ title: "Invalid Phone Number", description: "Phone number must be exactly 10 digits.", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', trimmedName);
      formDataToSend.append('email', trimmedEmail);
      formDataToSend.append('subject', trimmedSubject);
      formDataToSend.append('message', trimmedMessage);
      formDataToSend.append('phone', `+91${trimmedPhone}`); // Add static country code
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
          <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground bg-white px-1 font-medium text-sm">
              +91
            </span>
            <Input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, ''); // Only allow numbers
                if (val.length <= 10) {
                   setFormData(prev => ({ ...prev, phone: val }))
                }
              }}
              className="pl-12"
              placeholder="98765 43210"
              maxLength={10}
            />
          </div>
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
