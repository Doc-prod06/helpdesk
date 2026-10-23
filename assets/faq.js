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
    <p>No email, or locked out? <a href="submit.html?category=account">Open an Account &amp; Login ticket</a>.</p>`,
  },
  {
    category: "account",
    question: "My account is locked. What should I do?",
    answer: `<p>Accounts lock after several wrong passwords. Wait 15 minutes and try again, or <a href="submit.html?category=account">request a reset</a> and tell us which account is locked.</p>`,
  },
  {
    category: "account",
    question: "How do I change the email address on my account?",
    answer: `<p>Sign in, open <strong>Account settings</strong>, and update your email. We'll send a confirmation link to the new address.</p>`,
  },
  {
    category: "toner",
    question: "How do I order ink or toner?",
    answer: `<p><a href="submit.html?category=toner">Open a toner request</a> with the printer model and where it is. The model is printed on the front or top of the printer. Include which colors you need for color printers.</p>`,
  },
  {
    category: "toner",
    question: "How long does a toner order take?",
    answer: `<p>Most cartridges arrive within 2–3 business days. If the printer is completely out, set the urgency to <strong>High</strong>.</p>`,
  },
  {
    category: "laptop",
    question: "How do I request a laptop for a new hire?",
    answer: `<p><a href="submit.html?category=laptop">Open a New Laptop Setup request</a> at least 5 business days before the start date. Include the person's name, start date, role, and any software they'll need.</p>`,
  },
  {
    category: "laptop",
    question: "What comes set up on a new laptop?",
    answer: `<ul>
      <li>Company email and Microsoft Office</li>
      <li>Security updates and antivirus</li>
      <li>Network, Wi-Fi and printer access</li>
    </ul>
    <p>List any other software in your request and we'll install it before handing it over.</p>`,
  },
  {
    category: "technical",
    question: "My computer or an app isn't working. What should I try first?",
    answer: `<ul>
      <li>Restart the computer or the app.</li>
      <li>Check that you're connected to the network or Wi-Fi.</li>
      <li>For websites, try a private window or a different browser.</li>
    </ul>
    <p>Still stuck? <a href="submit.html?category=technical">Open a ticket</a> and include any error message you see.</p>`,
  },
  {
    category: "technical",
    question: "How do I check on a ticket I already submitted?",
    answer: `<p>Go to <a href="status.html">Check ticket status</a> and enter your ticket number (it starts with <strong>HD-</strong>) and the email you used. You can also reply to us there.</p>`,
  },
];
