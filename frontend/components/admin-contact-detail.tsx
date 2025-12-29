"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { contactService, ContactSubmission } from "@/lib/services/contactService"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ArrowLeft, Mail, Phone, Calendar, ShoppingBag } from "lucide-react"

export function AdminContactDetail() {
     const { id } = useParams()
     const router = useRouter()
     const { toast } = useToast()

     const [submission, setSubmission] = useState<ContactSubmission | null>(null)
     const [loading, setLoading] = useState(true)
     const [replyMessage, setReplyMessage] = useState("")
     const [sendingReply, setSendingReply] = useState(false)
     const [updatingStatus, setUpdatingStatus] = useState(false)

     useEffect(() => {
          if (id) fetchSubmission()
     }, [id])

     const fetchSubmission = async () => {
          try {
               setLoading(true)
               const response = await contactService.getById(id as string)
               if (response.data.success) {
                    setSubmission(response.data.data)
               }
          } catch (error) {
               toast({
                    title: "Error",
                    description: "Failed to fetch submission details",
                    variant: "destructive",
               })
          } finally {
               setLoading(false)
          }
     }

     const handleStatusChange = async (newStatus: string) => {
          try {
               setUpdatingStatus(true)
               await contactService.updateStatus(id as string, newStatus)
               setSubmission(prev => prev ? { ...prev, status: newStatus as any } : null)
               toast({
                    title: "Status Updated",
                    description: `Submission marked as ${newStatus}`,
               })
          } catch (error) {
               toast({
                    title: "Error",
                    description: "Failed to update status",
                    variant: "destructive",
               })
          } finally {
               setUpdatingStatus(false)
          }
     }

     const handleReply = async () => {
          if (!replyMessage.trim()) return

          try {
               setSendingReply(true)
               await contactService.reply(id as string, replyMessage)
               toast({
                    title: "Reply Sent",
                    description: "Your reply has been sent successfully.",
               })
               setReplyMessage("")
               // Optionally update status to 'replied' if backend does it automatically, we just refresh or set locally
               setSubmission(prev => prev ? { ...prev, status: 'replied' } : null)
          } catch (error) {
               toast({
                    title: "Error",
                    description: "Failed to send reply",
                    variant: "destructive",
               })
          } finally {
               setSendingReply(false)
          }
     }

     if (loading) return <div className="p-8 text-center text-[#8B6F47]">Loading details...</div>
     if (!submission) return <div className="p-8 text-center text-[#8B6F47]">Submission not found</div>

     return (
          <div className="space-y-6 max-w-4xl mx-auto pb-10">
               <div className="flex items-center gap-4">
                    <Button
                         variant="outline"
                         size="icon"
                         onClick={() => router.back()}
                         className="rounded-full border-[#E8DCC8] hover:bg-[#F9F5F0]"
                    >
                         <ArrowLeft className="h-4 w-4 text-[#6B4423]" />
                    </Button>
                    <div>
                         <h1 className="font-serif text-2xl font-bold text-[#6B4423]">Submission Query</h1>
                         <p className="text-sm text-[#8B6F47]">ID: #{submission.id}</p>
                    </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Details */}
                    <div className="md:col-span-2 space-y-6">
                         <Card className="rounded-2xl border-2 border-[#E8DCC8]">
                              <CardHeader className="bg-[#F9F5F0] border-b border-[#E8DCC8]">
                                   <div className="flex justify-between items-start">
                                        <div>
                                             <CardTitle className="text-xl text-[#6B4423]">{submission.subject}</CardTitle>
                                             <div className="flex items-center gap-2 mt-2 text-sm text-[#8B6F47]">
                                                  <Calendar className="h-4 w-4" />
                                                  {format(new Date(submission.created_at), 'PPP p')}
                                             </div>
                                        </div>
                                        <Badge className={`
                  ${submission.status === 'new' ? 'bg-blue-500' : ''}
                  ${submission.status === 'replied' ? 'bg-green-500' : ''}
                  ${submission.status === 'read' ? 'bg-gray-500' : ''}
                  ${submission.status === 'archived' ? 'bg-gray-500' : ''}
                `}>
                                             {submission.status.toUpperCase()}
                                        </Badge>
                                   </div>
                              </CardHeader>
                              <CardContent className="p-6">
                                   <div className="prose max-w-none text-[#6B4423]">
                                        <p className="whitespace-pre-wrap">{submission.message}</p>
                                   </div>
                              </CardContent>
                         </Card>

                         <Card className="rounded-2xl border-2 border-[#E8DCC8]">
                              <CardHeader>
                                   <CardTitle className="text-lg text-[#6B4423]">Reply to Customer</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                   <Textarea
                                        placeholder="Type your reply here..."
                                        className="min-h-[150px] border-[#E8DCC8] focus-visible:ring-[#2D5F3F]"
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                   />
                                   <div className="flex justify-end">
                                        <Button
                                             onClick={handleReply}
                                             disabled={!replyMessage.trim() || sendingReply}
                                             className="bg-[#2D5F3F] hover:bg-[#1E4A2F] text-white"
                                        >
                                             {sendingReply ? 'Sending...' : 'Send Reply'}
                                        </Button>
                                   </div>
                              </CardContent>
                         </Card>
                    </div>

                    {/* Right Column: Sidebar Info */}
                    <div className="space-y-6">
                         <Card className="rounded-2xl border-2 border-[#E8DCC8]">
                              <CardHeader>
                                   <CardTitle className="text-lg text-[#6B4423]">Customer Info</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                   <div className="flex flex-col gap-1">
                                        <span className="text-xs text-[#8B6F47] uppercase font-bold">Name</span>
                                        <span className="text-[#6B4423] font-medium">{submission.name}</span>
                                   </div>
                                   <div className="flex flex-col gap-1">
                                        <span className="text-xs text-[#8B6F47] uppercase font-bold">Email</span>
                                        <div className="flex items-center gap-2 text-[#6B4423]">
                                             <Mail className="h-4 w-4 text-[#2D5F3F]" />
                                             <a href={`mailto:${submission.email}`} className="hover:underline">{submission.email}</a>
                                        </div>
                                   </div>
                                   {submission.phone && (
                                        <div className="flex flex-col gap-1">
                                             <span className="text-xs text-[#8B6F47] uppercase font-bold">Phone</span>
                                             <div className="flex items-center gap-2 text-[#6B4423]">
                                                  <Phone className="h-4 w-4 text-[#2D5F3F]" />
                                                  <a href={`tel:${submission.phone}`} className="hover:underline">{submission.phone}</a>
                                             </div>
                                        </div>
                                   )}
                              </CardContent>
                         </Card>

                         {submission.order_number && (
                              <Card className="rounded-2xl border-2 border-[#E8DCC8]">
                                   <CardHeader>
                                        <CardTitle className="text-lg text-[#6B4423]">Related Order</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        <div className="flex items-center gap-2 text-[#6B4423] font-medium">
                                             <ShoppingBag className="h-4 w-4 text-[#2D5F3F]" />
                                             #{submission.order_number}
                                        </div>
                                   </CardContent>
                              </Card>
                         )}

                         {submission.attachment_url && (
                              <Card className="rounded-2xl border-2 border-[#E8DCC8]">
                                   <CardHeader>
                                        <CardTitle className="text-lg text-[#6B4423]">Attachment</CardTitle>
                                   </CardHeader>
                                   <CardContent>
                                        <div className="text-sm">
                                             <a
                                                  href={(process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'http://localhost:5000') + submission.attachment_url}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="text-blue-600 hover:underline flex items-center gap-2"
                                             >
                                                  <span className="truncate max-w-[200px]">{submission.attachment_name || 'View File'}</span>
                                                  <span className="text-xs text-muted-foreground">(Click to open)</span>
                                             </a>
                                        </div>
                                   </CardContent>
                              </Card>
                         )}

                         <Card className="rounded-2xl border-2 border-[#E8DCC8]">
                              <CardHeader>
                                   <CardTitle className="text-lg text-[#6B4423]">Actions</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                   <div className="flex flex-col gap-2">
                                        <span className="text-xs text-[#8B6F47] uppercase font-bold">Update Status</span>
                                        <Select value={submission.status} onValueChange={handleStatusChange} disabled={updatingStatus}>
                                             <SelectTrigger className="border-[#E8DCC8]">
                                                  <SelectValue />
                                             </SelectTrigger>
                                             <SelectContent>
                                                  <SelectItem value="new">New</SelectItem>
                                                  <SelectItem value="read">Read</SelectItem>
                                                  <SelectItem value="replied">Replied</SelectItem>
                                                  <SelectItem value="archived">Archived</SelectItem>
                                             </SelectContent>
                                        </Select>
                                   </div>
                              </CardContent>
                         </Card>
                    </div>
               </div>
          </div>
     )
}
