"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSiteConfig } from "@/contexts/site-config";

export default function ContactPage() {
  const { toast } = useToast();
  const config = useSiteConfig();
  const cp = config.contactPage ?? {};
  const hero = cp.hero ?? { title: "Contact Us", subtitle: "We're here to help and answer any questions you might have. We look forward to hearing from you.", image: "/bg1.png" };
  const heroImage = config.hero?.slides?.[0]?.image ?? "/bg1.png";
  const successMessage = cp.successMessage ?? "Thank you for contacting us. We will get back to you soon.";
  const siteName = config.siteName ?? "Kudan";
  const lgaSlug = siteName.toLowerCase();
  const contactDetails = cp.contactDetails ?? [
    { icon: "mapPin" as const, text: `${siteName} Local Government Secretariat, Kaduna State, Nigeria` },
    { icon: "phone" as const, text: "+234 7011 404 040" },
    { icon: "mail" as const, text: `General: info@${lgaSlug}lga.gov.ng | Support: support@${lgaSlug}lga.gov.ng` },
  ];
  const officeHours = cp.officeHours ?? "Monday - Friday: 8:00 AM - 4:00 PM\nSaturday & Sunday: Closed";
  const mapEmbedUrl = cp.mapEmbedUrl ?? "";
  const directionsText = cp.directionsText ?? `${siteName} Local Government Secretariat is located in the headquarters of ${siteName} LGA. It is accessible via the main road from Kaduna city. Public transportation is available from major cities and neighboring local government areas.`;
  const contactCardLabels: Record<string, string> = { mapPin: "Our Address", phone: "Phone", mail: "Email" };
  const contactIcons: Record<string, typeof MapPin> = { mapPin: MapPin, phone: Phone, mail: Mail };
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.message) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: successMessage,
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src={heroImage}
            alt={hero.title ?? "Contact Us"}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{hero.title}</h1>
          <p className="text-xl max-w-3xl mx-auto">{hero.subtitle}</p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactDetails.map((detail, index) => {
              const IconComponent = contactIcons[detail.icon as keyof typeof contactIcons] || MapPin;
              const label = contactCardLabels[detail.icon] ?? detail.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-5 w-5 text-brand" />
                      <CardTitle className="text-brand-dark">{label}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-line">{detail.text}</p>
                  </CardContent>
                </Card>
              );
            })}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-brand" />
                  <CardTitle className="text-brand-dark">Office Hours</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{officeHours}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-brand-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-3xl font-bold text-brand-dark mb-6">Send Us a Message</h2>
              
              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          placeholder="Your full name" 
                          value={formData.name}
                          onChange={handleChange}
                          required 
                        />
                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          placeholder="Your email address" 
                          value={formData.email}
                          onChange={handleChange}
                          required 
                        />
                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input 
                          id="subject" 
                          name="subject" 
                          placeholder="Subject of your message" 
                          value={formData.subject}
                          onChange={handleChange}
                          required 
                        />
                        {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea 
                          id="message" 
                          name="message" 
                          placeholder="Your message" 
                          rows={5}
                          value={formData.message}
                          onChange={handleChange}
                          required 
                        />
                        {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="bg-brand hover:bg-brand-hover"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Send className="mr-2 h-4 w-4" /> Send Message
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-brand-dark mb-6">Find Us</h2>
              
              {mapEmbedUrl ? (
                <Card>
                  <CardContent className="p-0 overflow-hidden rounded-lg">
                    <div className="aspect-video w-full">
                      <iframe
                        src={mapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full"
                        aria-label={`Map of ${siteName} Local Government`}
                      />
                    </div>
                  </CardContent>
                </Card>
              ) : null}
              
              <div className={`bg-white p-6 rounded-lg shadow-md ${mapEmbedUrl ? "mt-6" : ""}`}>
                <h3 className="text-xl font-semibold text-brand-dark mb-4">Directions</h3>
                <p className="text-gray-700 whitespace-pre-line">{directionsText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-dark mb-4">Frequently Asked Questions</h2>
            <div className="w-24 h-1 bg-brand mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-dark">What services does the local government provide?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {siteName} Local Government provides various services including primary healthcare, basic education, agricultural extension services, water supply, and maintenance of local infrastructure.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-dark">How can I apply for a business permit?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  To apply for a business permit, visit the Commerce Department at the Local Government Secretariat with your business registration documents, tax clearance certificate, and proof of address.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-dark">How do I report issues in my community?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  You can report issues by contacting your ward councilor, visiting the Local Government Secretariat, or using the contact form on this website. For emergencies, please call our emergency hotline.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-brand-dark">What agricultural support programs are available?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  {siteName} LGA offers various agricultural support programs including extension services, subsidized inputs, irrigation support, and market linkage through the {siteName} Agricultural Development Company (KADCO).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}