// FAQ / how-to articles. `category` should match an id in config.js.
// `answer` is HTML, so you can use links, lists and bold text.
window.HELPDESK_FAQ = [
  {
    category: "account",
    question: "How do I reset my password?",
    answer: `<ol>
      <li>Go to the sign-in page and choose <strong>Forgot password</strong>.</li>
      <li>Enter the email address on your account.</li>
      <li>Open the email we send you and follow the link within 30 minutes.</li>
    </ol>
    <p>No email? Check your spam folder, then <a href="submit.html?category=account">open a ticket</a>.</p>`,
  },
  {
    category: "account",
    question: "How do I change the email address on my account?",
    answer: `<p>Sign in, open <strong>Account settings</strong>, and update your email. We'll send a confirmation link to the new address.</p>`,
  },
  {
    category: "billing",
    question: "Where can I find my invoices?",
    answer: `<p>Invoices are emailed when each payment is processed. You can also download them from <strong>Account settings &gt; Billing</strong>.</p>`,
  },
  {
    category: "billing",
    question: "How do I request a refund?",
    answer: `<p><a href="submit.html?category=billing">Open a Billing ticket</a> with your invoice number and the reason for the refund. Approved refunds take 5–10 business days to appear.</p>`,
  },
  {
    category: "orders",
    question: "How can I track my order?",
    answer: `<p>Your shipping confirmation email includes a tracking link. Orders usually ship within 2 business days.</p>`,
  },
  {
    category: "orders",
    question: "What is your return policy?",
    answer: `<p>Most items can be returned within 30 days of delivery in their original condition. <a href="submit.html?category=orders">Open an Orders ticket</a> with your order number to start a return.</p>`,
  },
  {
    category: "technical",
    question: "The site or app isn't loading. What should I try?",
    answer: `<ul>
      <li>Refresh the page or restart the app.</li>
      <li>Clear your browser cache, or try a private window.</li>
      <li>Try a different browser or device.</li>
    </ul>
    <p>Still stuck? <a href="submit.html?category=technical">Open a ticket</a> and include any error message you see.</p>`,
  },
  {
    category: "other",
    question: "How do I check on a ticket I already submitted?",
    answer: `<p>Go to <a href="status.html">Check ticket status</a> and enter your ticket number (it starts with <strong>HD-</strong>) and the email you used. You can also reply to us there.</p>`,
  },
];
