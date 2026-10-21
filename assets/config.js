// Site settings. Edit this file to customize the helpdesk.
// The Supabase anon key is meant to be public; the database rules in supabase/schema.sql protect the data.
window.HELPDESK_CONFIG = {
  siteName: "Support Center",
  companyName: "Your Company",

  supabaseUrl: "https://cwyxfkzjrysmzboxwqtp.supabase.co",
  supabaseAnonKey: "sb_publishable_xuGoABoowtLiRcKXHXBUMA_3rF6L6X1",

  contact: {
    email: "support@example.com",
    phone: "(555) 555-0100",
    responseTime: "We reply to most tickets within 1 business day.",
  },

  // Times are 24-hour "HH:MM" in the timezone below. Use null for closed days.
  hours: {
    timezone: "America/New_York",
    timezoneLabel: "Eastern Time",
    schedule: {
      mon: ["08:00", "17:00"],
      tue: ["08:00", "17:00"],
      wed: ["08:00", "17:00"],
      thu: ["08:00", "17:00"],
      fri: ["08:00", "17:00"],
      sat: null,
      sun: null,
    },
  },

  // Request categories shown on the home page and the ticket form.
  // extraField adds an optional field to the form for that category.
  categories: [
    { id: "account", name: "Account & Login", icon: "🔐", description: "Sign-in problems, password resets, account changes." },
    { id: "billing", name: "Billing & Payments", icon: "💳", description: "Invoices, charges, refunds and payment methods.",
      extraField: { label: "Invoice or account number", placeholder: "e.g. INV-10423" } },
    { id: "orders", name: "Orders & Shipping", icon: "📦", description: "Order status, delivery, returns and exchanges.",
      extraField: { label: "Order number", placeholder: "e.g. 100245" } },
    { id: "technical", name: "Technical Issue", icon: "🛠️", description: "Something isn't working the way it should." },
    { id: "feedback", name: "Feedback & Ideas", icon: "💡", description: "Suggestions and feature requests." },
    { id: "other", name: "Something Else", icon: "💬", description: "Anything that doesn't fit the categories above." },
  ],
};
