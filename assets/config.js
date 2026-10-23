// Site settings. Edit this file to customize the helpdesk.
// The Supabase anon key is meant to be public; the database rules in supabase/schema.sql protect the data.
window.HELPDESK_CONFIG = {
  siteName: "ACS Helpdesk",
  companyName: "Alabama Clinical Schools",

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
    { id: "account", name: "Account & Login", icon: "🔐", description: "Sign-in problems, password resets, account changes.",
      extraField: { label: "Which account or system?", placeholder: "e.g. email, computer login, VPN" } },
    { id: "technical", name: "Technical Issue", icon: "🛠️", description: "Something isn't working the way it should." },
    { id: "toner", name: "Order Printer Ink/Toner", icon: "🖨️", description: "Request ink or toner cartridges for a printer.",
      extraField: { label: "Printer model and location", placeholder: "e.g. HP LaserJet M404, front office" } },
    { id: "laptop", name: "New Laptop Setup", icon: "💻", description: "Set up a laptop for a new or existing team member.",
      extraField: { label: "Who is it for, and when is it needed?", placeholder: "e.g. Jordan Lee, needed by Nov 3" } },
  ],
};
