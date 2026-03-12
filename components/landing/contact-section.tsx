"use client";

import { useState } from "react";
import { SectionWrapper } from "./section-wrapper";
import { Send, MapPin, Mail, Clock } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-foreground/20 placeholder:text-muted-foreground";

export const ContactSection = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <SectionWrapper id="contact">
      <div className="mb-16">
        <div className="section-label mb-4">
          <span className="mr-2 h-1.5 w-1.5 rounded-full bg-foreground" />
          Contact
        </div>
        <h2 className="text-3xl font-bold text-foreground md:text-4xl max-w-lg">
          Get in touch with the administration.
        </h2>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        {/* Form */}
        <div className="clean-card p-8">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border">
                <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-foreground">Message Sent</h3>
              <p className="mt-2 text-sm text-muted-foreground">We&apos;ll get back to you shortly.</p>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
              className="space-y-5"
            >
              <div>
                <label htmlFor="contact-name" className="mb-1.5 block text-sm text-muted-foreground">Name</label>
                <input id="contact-name" type="text" required className={inputClass} placeholder="Your full name" />
              </div>
              <div>
                <label htmlFor="contact-email" className="mb-1.5 block text-sm text-muted-foreground">Email</label>
                <input id="contact-email" type="email" required className={inputClass} placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="contact-msg" className="mb-1.5 block text-sm text-muted-foreground">Message</label>
                <textarea id="contact-msg" required rows={4} className={`${inputClass} resize-none`} placeholder="Your message..." />
              </div>
              <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90">
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div className="flex flex-col justify-center space-y-6">
          {[
            { icon: MapPin, title: "Address", content: "Pillai College of Engineering\nDr. K.M. Vasudevan Pillai Campus\nNew Panvel, Navi Mumbai \u2014 410206" },
            { icon: Mail, title: "Email", content: "support@pillai.edu" },
            { icon: Clock, title: "Office Hours", content: "Mon \u2013 Fri: 9:00 AM \u2013 5:00 PM\nSaturday: 9:00 AM \u2013 1:00 PM" },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};
