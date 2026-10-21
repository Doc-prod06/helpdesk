# Helpdesk

A customer support site: help articles, contact info and hours, ticket submission by category,
ticket status lookup with replies, and a staff queue. It runs for free on **GitHub Pages** (the website)
and **Supabase** (the ticket database and staff sign-in).

| Page | What it does |
| --- | --- |
| `index.html` | Home: search, request categories, help articles, contact and hours |
| `submit.html` | Ticket form. Suggests matching help articles as the customer types |
| `status.html` | Customer enters ticket number + email to see replies and respond |
| `admin.html` | Staff sign-in, ticket queue, replies, internal notes, status and assignment |

## 1. Create the database (Supabase, free)

1. Sign up at <https://supabase.com> and create a new project. Save the database password somewhere safe.
2. In the project, open **SQL Editor > New query**, paste all of `supabase/schema.sql`, and click **Run**.
3. Open **Project Settings > API Keys** and copy the **Publishable key** (`sb_publishable_...`).
   Your Project URL is `https://YOUR-PROJECT-ID.supabase.co`. Never put a secret key in the site.
4. Open **Authentication > Sign In / Providers** and turn **off** "Allow new users to sign up".
   Staff accounts are created by you, so nobody else can register.

## 2. Add staff accounts

1. **Authentication > Users > Add user > Create new user**: enter the staff member's email and a password.
2. Copy the new user's **UID**, then in **SQL Editor** run:

   ```sql
   insert into public.staff (user_id, display_name) values ('PASTE-UID-HERE', 'Dana');
   ```

   The display name is what customers see on replies. Repeat for each staff member.

## 3. Configure the site

Edit `assets/config.js`:

- `supabaseUrl` and `supabaseAnonKey` (the publishable key) from step 1. It is designed to be public.
- `siteName`, `companyName`, `contact`, `hours` (pick your timezone) and `categories`.

Edit `assets/faq.js` to write your own help articles.

## 4. Publish on GitHub Pages (free)

1. Create a **public** repository on <https://github.com/new> (free Pages requires a public repo;
   no ticket data lives in the repo, only the website code).
2. Push this folder to it:

   ```bash
   git remote add origin https://github.com/YOUR-USER/YOUR-REPO.git
   git push -u origin main
   ```

3. In the repository: **Settings > Pages > Build and deployment > Source: Deploy from a branch**,
   branch **main**, folder **/ (root)**, then **Save**.
4. After a minute the site is live at `https://YOUR-USER.github.io/YOUR-REPO/`.
   Staff sign in at `.../admin.html` (also linked in the footer).

**Custom domain (optional):** Settings > Pages > Custom domain, e.g. `support.yourcompany.com`,
then add the CNAME record GitHub shows you at your DNS provider and tick **Enforce HTTPS**.

## Try it locally

```bash
python -m http.server 8765
```

Then open <http://localhost:8765>.

## How the data is protected

- The public key can't read or change the tables directly (row level security).
- Customers use three database functions only: submit a ticket, view one ticket, reply to one ticket.
  Viewing or replying needs both the ticket number and the email it was submitted with.
- Staff access requires signing in with an account listed in the `staff` table.
- Internal notes are never returned to customers.
- Each email address can submit at most 5 tickets per hour, and the form has a hidden spam trap.

## Free tier limits worth knowing

- **Supabase free projects pause after 7 days with no activity.** Any visit that submits or loads
  a ticket counts as activity; if it pauses, click **Restore** in the Supabase dashboard.
- Supabase free: 500 MB database, plenty for many thousands of tickets.
- GitHub Pages: 100 GB bandwidth a month.

## Possible next steps

- Email notifications (to staff on new tickets, to customers on replies) with a Supabase Edge Function and a mail service such as Resend.
- Cloudflare Turnstile on the ticket form if spam becomes a problem.
- File attachments with Supabase Storage.

## Updating the site

Edit files, commit and push; GitHub republishes in about a minute. Browsers cache files for up to
10 minutes, so after changing anything in `assets/`, bump the `?v=` number on the asset links in
the `.html` pages (e.g. `?v=2` to `?v=3`) so visitors get the new version right away.
